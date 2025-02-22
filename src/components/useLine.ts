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

export function useLine({ map, flight, arrival, departure }: useLineProps) {
  const [line, setLine] = useState<FeatureCollection[] | null>(null)
  const [route, setRoute] = useState<any>(null)
  const [totalFrames, setTotalFrames] = useState<number>(0)

  const getRoute = async () => {
    const flightRoute = await requestFlightTrack(flight)
    setRoute(flightRoute)
    console.log('getRoute', flightRoute)
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

    // const avgTime =
    //   path
    //     .slice(1)
    //     .reduce(
    //       (sum: number, item: FlightPathElement, index: number) =>
    //         sum + (item.time - path[index].time),
    //       0
    //     ) /
    //   (path.length - 1)

    const splitLines: FlightPathElement[][] = []
    let line: FlightPathElement[] = []

    for (let i = 0; i < path.length - 1; ++i) {
      line.push(path[i])

      const crossed = isPathCrossingIDL(path[i], path[i + 1])
      crossed && console.log(crossed)
      if (crossed === '-->' || crossed === '<--') {
        const pointA: FlightPathElement = { ...path[i] }
        const pointB: FlightPathElement = path[i + 1]

        adjustCrossingPoints(pointA, pointB, crossed, {
          A: departure,
          B: arrival,
        })

        line.push(pointA)
        splitLines.push(line)
        line = [pointB] // * important!!!
      }
    }

    splitLines.push(line)
    splitLines[splitLines.length - 1].push(path[path.length - 1])

    const lines: FeatureCollection[] = []

    console.log(lines)

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

      const from = [lon1, lat1]
      const to = [lon2, lat2]
      const greatCircle = turf.greatCircle(turf.point(from), turf.point(to), {
        offset: 100,
        npoints: 200,
      })

      interpolatedCoords.push(...greatCircle.geometry.coordinates)
    }

    const { lat: finalLat, lon: finalLon } = coordinates[coordinates.length - 1]
    interpolatedCoords.push([finalLon, finalLat])

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
  // console.log('***RouteOnMap***', routeOnMap)

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

const isPathCrossingIDL = (
  A: FlightPathElement,
  B: FlightPathElement
): RouteDirection => {
  const Ax = A.longitude
  const Bx = B.longitude
  // -0>= W >=-180, 0 <= E <= 180
  // case1 A:W B:W A < B then -->
  // case2 A:W B:W A > B then  <--
  // case3 A:W B:E  then -->
  // case4 A:E B:W  then -->
  // case5 A:E B:E A < B  then -->
  // case6 A:E B:E A > B  then <--
  // case7 A:E B:W  then -->
  // case8 A:W B:E <--
  if (-0 >= Ax && Ax >= -180 && 0 <= Bx && Bx <= 180) {
    if (1 > Math.abs(Ax) && Math.abs(Ax) > 0) {
      return '-->'
    }
    return '<--'
  }
  if (-0 >= Bx && Bx >= -180 && 0 <= Ax && Ax <= 180) {
    if (1 > Math.abs(Ax) && Math.abs(Ax) > 0) {
      return '<--'
    }
    return '-->'
  }
  return false
}

const adjustCrossingPoints = (
  pointA: FlightPathElement,
  pointB: FlightPathElement,
  direction: East2West | West2East,
  airports: { A: any; B: any }
) => {
  if (1 > Math.abs(pointA.longitude) && Math.abs(pointA.longitude) > 0) {
    console.log('cross 적오선---', pointA, pointB, direction)
    pointA.longitude = -0
    pointB.longitude = 0
    pointA.latitude = 51.2975
    pointB.latitude = 51.2975
  } else {
    const latitude = handleFindCrossing(airports.A, airports.B)
    pointA.latitude = latitude // (pointA.latitude + pointB.latitude) / 2
    pointB.latitude = latitude
    if (direction === '-->') {
      pointA.longitude = 180
      pointB.longitude = -180
    } else if (direction === '<--') {
      pointA.longitude = -180
      pointB.longitude = 180
    }
  }
  console.log('-----A, B', pointA, pointB)
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
