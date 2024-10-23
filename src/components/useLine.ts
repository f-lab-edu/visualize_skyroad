import * as turf from '@turf/turf'
import { useEffect, useState } from 'react'
import { MapInstance } from 'react-map-gl'

import { FlightPathElement } from '../api/flight'
import { requestFlightTrack } from '../data/dataProcessingLayer'

interface useGetLineProps {
  arrival: any
  departure: any
  flight: any
  map: MapInstance | null
}

type FlightPosition = {
  lat: number
  lon: number
}

type LineStringGeometry = {
  type: 'LineString'
  coordinates: number[][] // [longitude, latitude] 쌍의 배열
}

type Feature = {
  type: 'Feature'
  geometry: LineStringGeometry
}

export type FeatureCollection = {
  type: 'FeatureCollection'
  features: Feature[]
}

const INTERPOLE_THRESHOLD = 500

export function useLine({ map, flight, arrival, departure }: useGetLineProps) {
  const [line, setLine] = useState<FeatureCollection | null>(null)
  const [route, setRoute] = useState(null) as any
  const [totalFrames, setTotalFrames] = useState<number>(0)

  const getRoute = async () => {
    const flightRoute = await requestFlightTrack(flight)
    setRoute(flightRoute)
  }

  useEffect(() => {
    if (flight) getRoute()
  }, [flight])

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

    // console.log(lon, normalizeLongitude(lon))
    // const lat: number = current[1] + (next[1] - current[1]) * (step / totalSteps)
    // const lon: number = current[2] + (next[2] - current[2]) * (step / totalSteps)
    // return [lat, lon]
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
      'line-width': 4,
      'line-opacity': 0.8,
    }

    if (isDash) {
      paintOptions['line-dasharray'] = [4, 2]
    }

    map.addLayer({
      id: name,
      type: 'line',
      source: name,
      layout: {},
      paint: paintOptions,
    })
  }

  const drawStraightLine = async (map: any, line: FeatureCollection) => {
    const option = { name: 'straight-line', color: 'yellow', isDash: true }

    if (map.isStyleLoaded()) {
      drawLineOnRouteLayer(map, line, option)
    } else {
      map.on('load', () => {
        drawLineOnRouteLayer(map, line, option)
      })
    }
  }

  const getLineFromRoute = async ({
    departure,
    arrival,
    flight,
  }: {
    departure: any
    arrival: any
    flight: any
  }): Promise<FeatureCollection> => {
    return new Promise(async (resolve) => {
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

      const coordinates = await interpolatedRawPath(
        [departureAirport, arrivalAirport],
        INTERPOLE_THRESHOLD
      )
      const filteredCoordenates = await removeDuplicateCoordinates(coordinates)
      const interpolatedPath =
        await interpolateGreatCirclePath(filteredCoordenates)

      const line: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: interpolatedPath as number[][],
            },
          },
        ],
      }

      resolve(line)
    })
  }

  useEffect(() => {
    if (map && route) {
      getLineFromRoute({
        departure,
        arrival,
        flight,
      }).then(setLine)
    }
  }, [map, route])

  useEffect(() => {
    if (map && line) {
      setTotalFrames(line?.features[0].geometry.coordinates.length)

      drawStraightLine(map, line)
    }
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
