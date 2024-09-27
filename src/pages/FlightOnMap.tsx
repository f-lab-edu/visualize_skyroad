import * as turf from '@turf/turf'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import React, { useEffect, useRef, useState } from 'react'
import { Map, MapRef } from 'react-map-gl'
import { useLocation } from 'react-router-dom'
import { requestFlightTrack } from '../data/dataProcessingLayer'
import { FlightPathElement } from "../api/flight"

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

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
        return <p>No flight details available.</p>
    }

    const getTrack = async () => {
        const track = await requestFlightTrack(flight)
        setRoute(track)
    }

    useEffect(() => {
        if (!flight) return
        getTrack()
    }, [flight])

    const addOrUpdateRouteLayer = (map: any, routeOnMap: FeatureCollection, option = { name: "route", color: "blue" }) => {
        if (map.getSource(option.name)) {
            // 이미 존재하는 경로 데이터 업데이트
            map.getSource(option.name).setData(routeOnMap)
        } else {
            // 새로운 경로 데이터 추가
            map.addSource(option.name, {
                type: 'geojson',
                data: routeOnMap,
            })

            map.addLayer({
                id: option.name,
                source: option.name,
                type: 'line',
                paint: {
                    'line-width': 4,
                    'line-color': option.color,
                    'line-opacity': 0.8,
                },
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

    const draw2DLine = async () => {
        const map = mapRef.current?.getMap()

        if (!map) {
            alert("맵을 불러오는데 실패하였습니다.")
            return
        }

        const leftSplit: FlightPathElement[] = route.path.filter((coord: number[]) => coord[2] < 0).map((coord: number[]) => ({
            time: coord[0],
            latitude: coord[1],
            longitude: coord[2],
            baro_altitude: coord[3],
            true_track: coord[4],
            on_ground: coord[5]
        }))

        const rightSplit: FlightPathElement[] = route.path.filter((coord: number[]) => coord[2] >= 0).map((coord: number[]) => ({
            time: coord[0],
            latitude: coord[1],
            longitude: coord[2],
            baro_altitude: coord[3],
            true_track: coord[4],
            on_ground: coord[5]
        }))

        const leftCoordinates = await interpolatedRawPath(leftSplit, 500)//.map(([lat, lon]) => ({ lat, lon }))
        const rightCoordinates = await interpolatedRawPath(rightSplit, 500)//.map(([lat, lon]) => ({ lat, lon }))

        const leftFilteredPathCoordinates = await removeDuplicateCoordinates(leftCoordinates)
        const rightFilteredPathCoordinates = await removeDuplicateCoordinates(rightCoordinates)

        // const middleLatitude = (rightFilteredPathCoordinates[0].lat + leftFilteredPathCoordinates[leftFilteredPathCoordinates.length - 1].lat) / 2
        // const leftInterpolatedPath = await interpolateGreatCirclePath([...leftFilteredPathCoordinates, { lon: -180, lat: middleLatitude }])
        // const rightInterpolatedPath = await interpolateGreatCirclePath([{ lon: 180, lat: middleLatitude }, ...rightFilteredPathCoordinates])

        const leftInterpolatedPath = await interpolateGreatCirclePath([...leftFilteredPathCoordinates])
        const rightInterpolatedPath = await interpolateGreatCirclePath([...rightFilteredPathCoordinates])

        const leftRouteOnMap: FeatureCollection = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: leftInterpolatedPath as number[][],
                    },
                },
            ],
        }

        const rightRouteOnMap: FeatureCollection = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: rightInterpolatedPath as number[][],
                    },
                },
            ],
        }

        console.log(leftRouteOnMap, rightRouteOnMap)

        if (map.isStyleLoaded()) {
            addOrUpdateRouteLayer(map, rightRouteOnMap, { name: "right-route", color: "red" })
            addOrUpdateRouteLayer(map, leftRouteOnMap, { name: "left-route", color: "blue" })
        } else {
            map.on('load', () => {
                addOrUpdateRouteLayer(map, rightRouteOnMap, { name: "right-route", color: "red" })
                addOrUpdateRouteLayer(map, leftRouteOnMap, { name: "left-route", color: "blue" })
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

    const drawFeaturesOnMap = async () => {
        if (route == null)
            return

        fitMapBound()

        draw2DLine()
    }

    useEffect(() => {
        drawFeaturesOnMap()
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

const normalizeLongitude = (lon: number) => {
    if (lon > 180) {
        return lon - 360;
    } else if (lon < -180) {
        return lon + 360;
    }
    return lon;
};

const linearInterpFn = (
    current: FlightPathElement,
    next: FlightPathElement,
    step: number, totalSteps: number
): FlightPosition => {

    const lat: number = current.latitude + (next.latitude - current.latitude) * (step / totalSteps);

    if (current.longitude < 0 && next.longitude > 0) {
        const lon: number = current.longitude + (next.longitude - 360 - current.longitude) * (step / totalSteps);
        return { lat: lat, lon: lon };
    }

    const lon: number = current.longitude + (next.longitude - current.longitude) * (step / totalSteps);
    return { lat: lat, lon: lon }

    // console.log(lon, normalizeLongitude(lon));
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

const addSVGImageToMap = (map: any) => {
    const svgUrl = '/vite.svg' // SVG 이미지 경로
    const img = new Image()
    img.src = svgUrl

    img.onload = () => {
        map.addImage('custom-airport-icon', img, { sdf: true })
    }
}
