import * as turf from '@turf/turf'
import { useEffect, useState } from 'react'
import { MapInstance } from 'react-map-gl'

import { FlightPathElement, FeatureCollection, FlightPosition } from '../api/flight'
import { requestFlightTrack } from '../data/dataProcessingLayer'
// import { FeatureCollection } from '@turf/turf'

interface useLineProps {
  arrival: any
  departure: any
  flight: any
  map: MapInstance | null
}

const INTERPOLE_THRESHOLD = 500

export function useLine({ map, flight, arrival, departure }: useLineProps) {
  const [line, setLine] = useState<FeatureCollection[] | null>(null)
  const [route, setRoute] = useState<any>(null)
  const [totalFrames, setTotalFrames] = useState<number>(0)

  const getRoute = async () => {
    const flightRoute = await requestFlightTrack(flight)
    setRoute(flightRoute)
  }

  useEffect(() => {
    if (flight) {
      getRoute()
    }
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
        setTotalFrames(totalFrames + item.features[0].geometry.coordinates.length)
        drawStraightLine(map, item, `line-${index}`)
      })
    }
    // if (map && line) {

    // }
  }, [line])

  return {
    line,
    route,
    totalFrames,
  }
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
    current.latitude +
    (next.latitude - current.latitude) * (step / totalSteps)

  if (current.longitude < 0 && next.longitude > 0) {
    // const lon: number = current.longitude + (next.longitude - 360 - current.longitude) * (step / totalSteps)
    // return { lat: lat, lon: lon }
  }

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

        if (numNewPoints > 1) {
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

  // if (isDash) {
  //   paintOptions['line-dasharray'] = [2, 2]
  // }

  map.addLayer({
    id: name,
    type: 'line',
    source: name,
    layout: {},
    paint: paintOptions,
  })
}

const drawStraightLine = async (map: any, line: FeatureCollection, layerName: string) => {
  const option = { name: layerName || 'straight-line', color: 'yellow', isDash: true }
  drawLineOnRouteLayer(map, line, option)
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
    const timestampStarted = route.path.at(0)[0] // [0]
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

    const path = [departureAirport, ...route.path.map((item: any) => {
      const casted: FlightPathElement = {
        time: Number(item[0]),
        latitude: Number(item[1]),
        longitude: Number(item[2]),
        baro_altitude: Number(item[3]),
        true_track: Number(item[4]),
        on_ground: Boolean(item[5]),
      }
      return casted
    })]
    path.push(arrivalAirport)

    const splitLines: FlightPathElement[][] = []
    const pivotIndex = findSignChangeIndices(path)
    splitLines.push(path.slice(0, pivotIndex))

    if (pivotIndex > -1) {
      splitLines.push(path.slice(pivotIndex))

      splitLines[0][0].longitude = 0
      splitLines[0][-1].longitude = 0
      splitLines[-1][0].longitude = 0
      splitLines[-1][-1].longitude = 0

      // if() {

      // 
      // }

    }

    // if (isPathCrossingIDL(path[i], path[i + 1])) {
    //   const pointA: FlightPathElement = path[i]
    //   const pointB: FlightPathElement = path[i + 1]
    //   const latitude: number = (pointA.latitude + pointB.latitude) / 1.45
    //   pointA.latitude = latitude
    //   pointB.latitude = latitude
    //   pointA.longitude = -180
    //   pointB.longitude = 180

    //   line.push(pointA)
    //   splitLines.push(line)
    //   line = [pointB]

    // } else {
    //   line.push(path[i])

    // }

    console.log(splitLines, path, arrival, departure, isPathCrossingIDL(departureAirport, arrivalAirport))

    const lines: FeatureCollection[] = []
    splitLines.forEach(line => {
      interpolatedRawPath(
        line, // [departureAirport, arrivalAirport],
        INTERPOLE_THRESHOLD
      )
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
                // properties: null
              },
            ],
          }
          lines.push(lineFC)
        })
        .catch(reject)
    })
    resolve(lines)
  })
}

const isPathCrossingIDL = (A: FlightPathElement, B: FlightPathElement): boolean => {
  /* IDL: 국제 날짜변경선 */
  if (A.longitude < B.longitude && A.longitude < 0 && B.longitude > 0)
    return true
  if (A.longitude > B.longitude && A.longitude > 0 && B.longitude < 0)
    return true

  return false
}

const findSignChangeIndices = (arr: FlightPathElement[]): number => {
  for (let i = 1; i < arr.length; i++) {
    const A = arr[i - 1]
    const B = arr[i]
    if ((A.longitude >= 0 && B.longitude < 0) ||
      (A.longitude < 0 && A.longitude >= 0)) {
      return i
    }
  }
  return -1
}
