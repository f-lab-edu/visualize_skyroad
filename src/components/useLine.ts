import * as turf from '@turf/turf'
import * as d3 from 'd3'
import { useEffect, useState } from 'react'
import { MapInstance } from 'react-map-gl'

import {
  FeatureCollection,
  FlightPathElement,
  FlightPosition,
} from '../api/flight'
import { requestFlightTrack } from '../data/dataProcessingLayer'

type East2West = '-->'
type West2East = '<--'
type RouteDirection = East2West | false | West2East

interface useLineProps {
  arrival: any
  departure: any
  flight: any
  map: MapInstance | null
}

const INTERPOLE_THRESHOLD = 100
const MERIDIAN_THRESHOLD = 1.0;
type CrossingType = {
  direction: RouteDirection
  type: 'IDL' | 'MERIDIAN'  // IDL: 날짜변경선, MERIDIAN: 본초자오선
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2초

export function useLine({ map, flight, arrival, departure }: useLineProps) {
  const [line, setLine] = useState<FeatureCollection[] | null>(null)
  const [route, setRoute] = useState<any>(null)
  const [totalFrames, setTotalFrames] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const getRoute = async () => {
    setIsLoading(true)
    setError(null)

    let retryCount = 0

    const fetchWithRetry = async (): Promise<any> => {
      try {
        const flightRoute = await requestFlightTrack(flight)
        return flightRoute
      } catch (error: any) {
        if (error.status === 429 && retryCount < MAX_RETRIES) {
          retryCount++
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1)
          console.log(`429 에러 발생, ${retryCount}번째 재시도... ${delay}ms 후 재시도`)

          await new Promise(resolve => setTimeout(resolve, delay))
          return fetchWithRetry()
        }
        throw error
      }
    }

    try {
      const flightRoute = await fetchWithRetry()
      setRoute(flightRoute)
      setIsLoading(false)
      console.log('getRoute 성공:', flightRoute)
    } catch (error: any) {
      console.error('getRoute 실패:', error)
      setError(error)
      setIsLoading(false)
      setRoute(null)
    }
  }

  useEffect(() => {
    if (flight) getRoute()
  }, [flight])

  useEffect(() => {
    if (map && route) {
      getLineFromRoute({
        departure,
        arrival,
        route,
      }).then(setLine)
    }
  }, [map, route])

  useEffect(() => {
    if (map && line) {
      line.forEach((item: any, index: number) => {
        drawStraightLine(map, item, `line-${index}`)
      })
      setTotalFrames(
        line.length > 1
          ? line[0].features[0].geometry.coordinates.length +
          line[1].features[0].geometry.coordinates.length
          : line[0].features[0].geometry.coordinates.length
      )
    }
  }, [line])

  return {
    line,
    route,
    totalFrames,
    isLoading,
    error
  }
}

const getLineFromRoute = ({
  departure,
  arrival,
  route,
}: {
  departure: any
  arrival: any
  route: any
}): Promise<FeatureCollection[]> => {
  return new Promise((resolve, reject) => {
    const timestampStarted = route.path.at(0)[0]
    const timestampTerminated = route.path.at(-1)[0]
    const unitTime =
      (timestampTerminated - timestampStarted) / INTERPOLE_THRESHOLD

    const departureAirport: FlightPathElement = {
      time: timestampStarted - unitTime,
      latitude: departure.latitude,
      longitude: departure.longitude,
      baro_altitude: 0,
      true_track: 0,
      on_ground: true,
    }

    const arrivalAirport: FlightPathElement = {
      time: timestampTerminated + unitTime,
      latitude: arrival.latitude,
      longitude: arrival.longitude,
      baro_altitude: 0,
      true_track: 0,
      on_ground: true,
    }

    const path = [
      departureAirport,
      ...route.path.map((item: any) => {
        const casted: FlightPathElement = {
          time: Number(item[0]),
          latitude: Number(item[1]),
          longitude: Number(item[2]),
          baro_altitude: Number(item[3]),
          true_track: Number(item[4]),
          on_ground: Boolean(item[5]),
        }
        return casted
      }),
    ]
    path.push(arrivalAirport)

    const splitLines: FlightPathElement[][] = []
    let line: FlightPathElement[] = []

    for (let i = 0; i < path.length - 1; ++i) {
      line.push(path[i])

      const crossing = isPathCrossing(path[i], path[i + 1])
      if (crossing) {
        console.log('경로 교차 발생:', {
          type: crossing.type,
          direction: crossing.direction,
          pointA: path[i].longitude,
          pointB: path[i + 1].longitude
        })

        const pointA: FlightPathElement = { ...path[i] }
        const pointB: FlightPathElement = { ...path[i + 1] }

        adjustCrossingPoints(pointA, pointB, crossing, {
          A: departure,
          B: arrival,
        })

        line.push(pointA)
        splitLines.push([...line])
        line = [{ ...pointB }]
      }
    }

    if (line.length > 0) {
      line.push(path[path.length - 1])
      splitLines.push(line)
    }

    const lines: FeatureCollection[] = []

    Promise.all(
      splitLines.map((line) =>
        interpolatedRawPath(line, INTERPOLE_THRESHOLD)
          .then(removeDuplicateCoordinates)
          .then(interpolateGreatCirclePath)
          .then((interpolatedPath) => {
            const lineFC: FeatureCollection = {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: interpolatedPath,
                  },
                },
              ],
            }
            lines.push(lineFC)
          })
      )
    )
      .then(() => resolve(lines))
      .catch(reject)
  })
}

const removeDuplicateCoordinates = (
  coordinates: FlightPosition[]
): Promise<FlightPosition[]> => {
  return new Promise((resolve) => {
    const removedCoordinates = coordinates.filter(
      (coord, index, self) =>
        index === 0 ||
        coord.lat !== self[index - 1].lat ||
        coord.lon !== self[index - 1].lon
    )

    resolve(removedCoordinates)
  })
}

const interpolateGreatCirclePath = (
  coordinates: FlightPosition[]
): Promise<any[]> => {
  return new Promise((resolve) => {
    const interpolatedCoords: any = []

    for (let i = 0; i < coordinates.length - 1; i++) {
      const { lat: lat1, lon: lon1 } = coordinates[i]
      const { lat: lat2, lon: lon2 } = coordinates[i + 1]

      if ((lon1 * lon2) <= 0 && Math.abs(lon1 - lon2) < 180) {
        const ratio = Math.abs(lon1) / Math.abs(lon1 - lon2)
        const intersectLat = lat1 + (lat2 - lat1) * ratio

        const path1 = turf.greatCircle(
          turf.point([lon1, lat1]),
          turf.point([0, intersectLat]),
          { npoints: 300 }
        )

        const path2 = turf.greatCircle(
          turf.point([0, intersectLat]),
          turf.point([lon2, lat2]),
          { npoints: 300 }
        )

        interpolatedCoords.push(
          ...path1.geometry.coordinates,
          ...path2.geometry.coordinates
        )
      } else {
        const greatCircle = turf.greatCircle(
          turf.point([lon1, lat1]),
          turf.point([lon2, lat2]),
          { npoints: 200 }
        )
        interpolatedCoords.push(...greatCircle.geometry.coordinates)
      }
    }

    resolve(interpolatedCoords)
  })
}

const linearInterpFn = (
  current: FlightPathElement,
  next: FlightPathElement,
  step: number,
  totalSteps: number
): FlightPosition => {
  const lat: number =
    current.latitude + (next.latitude - current.latitude) * (step / totalSteps)

  const lon: number =
    current.longitude +
    (next.longitude - current.longitude) * (step / totalSteps)
  return { lat: lat, lon: lon }
}

const interpolatedRawPath = (
  path: FlightPathElement[],
  threshold: number
): Promise<FlightPosition[]> => {
  return new Promise((resolve) => {
    const newpath: FlightPosition[] = []

    for (let i = 0; i < path.length - 1; i++) {
      const current: FlightPathElement = path[i]
      const next: FlightPathElement = path[i + 1]

      newpath.push({ lat: current.latitude, lon: current.longitude })

      const timeDif = Math.abs(current.time - next.time)

      if (timeDif > threshold) {
        const numNewPoints = Math.ceil(timeDif / threshold)

        if (numNewPoints > 10) {
          for (let step = 0; step <= numNewPoints; step++) {
            const newpoint: FlightPosition = linearInterpFn(
              current,
              next,
              step,
              numNewPoints
            )
            newpath.push(newpoint)
          }
        }
      }
    }

    const { latitude: finalLat, longitude: finalLon } = path[path.length - 1]

    newpath.push({ lat: finalLat, lon: finalLon })

    resolve(newpath)
  })
}

const drawLineOnRouteLayer = (
  map: any,
  routeOnMap: FeatureCollection,
  option = { name: 'route', color: 'blue', isDash: false }
) => {
  const { name = 'route', color = 'blue', isDash = false } = option

  if (map.getSource(name)) {
    map.getSource(name).setData(routeOnMap)
    return
  }

  map.addSource(name, {
    type: 'geojson',
    data: routeOnMap,
  })

  const paintOptions: any = {
    'line-color': color,
    'line-width': 2,
    'line-opacity': 0.8,
  }

  if (isDash) {
    paintOptions['line-dasharray'] = [2, 2]
  }

  map.addLayer({
    id: name,
    type: 'line',
    source: name,
    layout: {},
    paint: paintOptions,
  })
}

const drawStraightLine = async (
  map: any,
  line: FeatureCollection,
  layerName: string
) => {
  const option = {
    name: layerName || 'straight-line',
    color: 'yellow',
    isDash: true,
  }
  drawLineOnRouteLayer(map, line, option)
}

const isPathCrossing = (A: FlightPathElement, B: FlightPathElement): CrossingType | null => {
  const Ax = A.longitude
  const Bx = B.longitude

  if (Math.abs(Ax - Bx) > 180) {
    if (Ax > 0 && Bx < 0) return { direction: '-->', type: 'IDL' }
    if (Ax < 0 && Bx > 0) return { direction: '<--', type: 'IDL' }
  }

  if ((Ax * Bx) <= 0) {
    if (Math.abs(Ax - Bx) < 0.0001) return null;

    if (Ax >= 0 && Bx < 0) {
      return { direction: '-->', type: 'MERIDIAN' }
    }
    if (Ax < 0 && Bx >= 0) {
      return { direction: '<--', type: 'MERIDIAN' }
    }
  }

  return null
}

const adjustCrossingPoints = (
  pointA: FlightPathElement,
  pointB: FlightPathElement,
  crossing: CrossingType,
  airports: { A: any; B: any }
) => {
  if (crossing.type === 'MERIDIAN') {
    const ratio = Math.abs(pointA.longitude) / Math.abs(pointA.longitude - pointB.longitude)
    const intersectLat = pointA.latitude + (pointB.latitude - pointA.latitude) * ratio

    const OFFSET = 0.0001
    if (crossing.direction === '-->') {
      pointA.longitude = OFFSET
      pointB.longitude = -OFFSET
    } else {
      pointA.longitude = -OFFSET
      pointB.longitude = OFFSET
    }
    pointA.latitude = intersectLat
    pointB.latitude = intersectLat
  } else {
    const latitude = handleFindCrossing(airports.A, airports.B)
    pointA.latitude = latitude
    pointB.latitude = latitude
    if (crossing.direction === '-->') {
      pointA.longitude = 180
      pointB.longitude = -180
    } else {
      pointA.longitude = -180
      pointB.longitude = 180
    }
  }

  console.log('보정된 좌표:', {
    type: crossing.type,
    direction: crossing.direction,
    pointA: { lat: pointA.latitude, lon: pointA.longitude },
    pointB: { lat: pointB.latitude, lon: pointB.longitude }
  })
}

const handleFindCrossing = (A: any, B: any): number => {
  const start = turf.point([A.longitude, A.latitude])
  const end = turf.point([B.longitude, B.latitude])
  const greatCircleLine = turf.greatCircle(start, end, { npoints: 100 })
  if (greatCircleLine.geometry.type === 'MultiLineString') {
    const lastIndex: number = greatCircleLine.geometry.coordinates[0].length - 1
    return greatCircleLine.geometry.coordinates[0][lastIndex][1]
  }
  return (A.latitude + B.latitude) / 2
}
