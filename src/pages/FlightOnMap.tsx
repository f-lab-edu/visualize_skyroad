import React, { useEffect, useRef, useState } from 'react'
import * as turf from '@turf/turf'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Map, MapRef } from 'react-map-gl'
import { useLocation } from 'react-router-dom'
import { requestFlightTrack } from '../data/dataProcessingLayer'
import { FlightPathElement } from "../api/flight"


const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY
const ERRORMESSAGE = { NOFLIGHTDETAIL: "항공상세정보를 가져오지 못하였습니다." }

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

type FeatureCollection = {
    type: 'FeatureCollection'
    features: Feature[]
}


const FlightOnMap: React.FC = ({ }) => {
    const mapRef = useRef<MapRef>(null)
    const location = useLocation()
    const { departure, arrival, flight } = location.state || {}
    const [route, setRoute] = useState(null) as any

    if (!departure || !arrival || !flight) {
        return <p>{ERRORMESSAGE.NOFLIGHTDETAIL}</p>
    }

    const getRoute = async () => {
        const flightRoute = await requestFlightTrack(flight)
        setRoute(flightRoute)
    }

    const addOrUpdateRouteLayer = (map: any, routeOnMap: FeatureCollection, option = { name: "route", color: "blue", isDash: false }) => {

        const { name = "route", color = "blue", isDash = false } = option

        if (map.getSource(name)) {

            map.getSource(name).setData(routeOnMap)

        } else {

            map.addSource(name, {
                type: 'geojson',
                data: routeOnMap,
            })

            const paintOptions: any = {
                'line-color': color,
                'line-width': 4,
                'line-opacity': 0.8
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


            // addSVGImageToMap(map)

            // map.addSource('point', {
            //     'type': 'geojson',
            //     'data': {
            //         'type': 'FeatureCollection',
            //         'features': [
            //             {
            //                 'type': 'Feature',
            //                 'geometry': {
            //                     'type': 'Point',
            //                     'coordinates': [126.39670000000001, 37.4895], // 좌표 설정
            //                 },
            //             },
            //         ],
            //     },
            // })

            // map.addLayer({
            //     'id': 'point',
            //     'source': 'point',
            //     'type': 'symbol',
            //     'layout': {
            //         'icon-image': 'custom-airport-icon', // 커스텀 아이콘 사용
            //         'icon-rotate': ['get', 'bearing'],
            //         'icon-rotation-alignment': 'map',
            //         'icon-overlap': 'always',
            //         'icon-ignore-placement': true,
            //     },
            // })
        }
    }

    const drawStraightLine = async () => {
        const map = mapRef.current?.getMap()

        if (!map) {
            alert("맵을 불러오는데 실패하였습니다.")
            return
        }

        const start: FlightPathElement = {
            time: route.path[0][0],
            latitude: route.path[0][1],
            longitude: route.path[0][2],
            baro_altitude: route.path[0][3],
            true_track: route.path[0][4],
            on_ground: route.path[0][5]
        }
        const end: FlightPathElement = {
            time: route.path[route.path.length - 1][0],
            latitude: route.path[route.path.length - 1][1],
            longitude: route.path[route.path.length - 1][2],
            baro_altitude: route.path[route.path.length - 1][3],
            true_track: route.path[route.path.length - 1][4],
            on_ground: route.path[route.path.length - 1][5]
        }
        console.log(start, end)

        const coordinates = await interpolatedRawPath([start, end], 500)
        const filteredCoordenates = await removeDuplicateCoordinates(coordinates)
        const interpolatedPath = await interpolateGreatCirclePath(filteredCoordenates)
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
        const op = { name: "straight-line", color: "yellow", isDash: true }

        if (map.isStyleLoaded()) {
            addOrUpdateRouteLayer(map, line, op)
        } else {
            map.on('load', () => {
                addOrUpdateRouteLayer(map, line, op)
            })
        }

    }

    const fitMapBound = () => {
        const map = mapRef.current?.getMap()

        const lengthFlight = route.path.length
        const from = route.path[0]
        const to = route.path[lengthFlight - 1]

        const fromPosition: [number, number] = [from[2], from[1]]
        const toPosition: [number, number] = [to[2], to[1]]

        map?.fitBounds([fromPosition, toPosition], {
            padding: 100,
            maxZoom: 5,
        })

        return () => map?.remove()
    }

    useEffect(() => {

        if (!flight)
            return

        getRoute()

    }, [flight])

    useEffect(() => {
        if (!route)
            return

        fitMapBound()
        drawStraightLine()

    }, [route])


    return (<>
        <Map
            ref={mapRef}
            mapLib={maplibregl as any}
            initialViewState={{
                longitude: 126.3967,
                latitude: 37.4895,
                zoom: 5,
            }}
            style={{ width: '100%', height: '600px' }}
            mapStyle={`https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`}
        />

    </>)
}

export default FlightOnMap


const linearInterpFn = (
    current: FlightPathElement,
    next: FlightPathElement,
    step: number, totalSteps: number
): FlightPosition => {

    const lat: number = current.latitude + (next.latitude - current.latitude) * (step / totalSteps)

    if (current.longitude < 0 && next.longitude > 0) {
        // const lon: number = current.longitude + (next.longitude - 360 - current.longitude) * (step / totalSteps)
        // return { lat: lat, lon: lon }
    }

    const lon: number = current.longitude + (next.longitude - current.longitude) * (step / totalSteps)
    return { lat: lat, lon: lon }

    // console.log(lon, normalizeLongitude(lon))
    // const lat: number = current[1] + (next[1] - current[1]) * (step / totalSteps)
    // const lon: number = current[2] + (next[2] - current[2]) * (step / totalSteps)
    // return [lat, lon]
}

const interpolatedRawPath = (path: FlightPathElement[], threshold: number) => {
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
                    const newpoint: FlightPosition = linearInterpFn(current, next, step, numNewPoints)
                    newpath.push(newpoint)
                }
            }
        }

    }

    console.log(path)

    const { latitude: finalLat, longitude: finalLon } = path[path.length - 1]

    newpath.push({ lat: finalLat, lon: finalLon })

    return newpath
}

const removeDuplicateCoordinates = (coordinates: FlightPosition[]) => {
    return coordinates.filter((coord, index, self) =>
        index === 0 || coord.lat !== self[index - 1].lat || coord.lon !== self[index - 1].lon
    )
}

const interpolateGreatCirclePath = (coordinates: FlightPosition[]) => {
    const interpolatedCoords = []

    for (let i = 0; i < coordinates.length - 1; i++) {

        const { lat: lat1, lon: lon1 } = coordinates[i]
        const { lat: lat2, lon: lon2 } = coordinates[i + 1]

        console.log(`From: [${lon1}, ${lat1}] ---- To: [${lon2}, ${lat2}]`)

        const from = [lon1, lat1]
        const to = [lon2, lat2]
        const greatCircle = turf.greatCircle(turf.point(from), turf.point(to), { offset: 100, npoints: 200 })

        interpolatedCoords.push(...greatCircle.geometry.coordinates)
    }

    const { lat: finalLat, lon: finalLon } = coordinates[coordinates.length - 1]
    interpolatedCoords.push([finalLon, finalLat])

    return interpolatedCoords
}
