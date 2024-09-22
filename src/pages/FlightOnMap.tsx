import React, { useEffect, useRef, useState } from 'react'
import { Map, MapRef } from 'react-map-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibregl from 'maplibre-gl'
import * as turf from '@turf/turf'
import { useLocation } from 'react-router-dom'
import { requestFlightTrack } from '../dataProcessingLayer'
import { Z_ASCII } from 'zlib'

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

    const addOrUpdateRouteLayer = (map: any, routeOnMap: FeatureCollection) => {
        if (map.getSource('route')) {
            // 이미 존재하는 경로 데이터 업데이트
            map.getSource('route').setData(routeOnMap)
        } else {
            // 새로운 경로 데이터 추가
            map.addSource('route', {
                type: 'geojson',
                data: routeOnMap,
            })

            map.addLayer({
                id: 'route',
                source: 'route',
                type: 'line',
                paint: {
                    'line-width': 4,
                    'line-color': 'blue',
                    'line-opacity': 0.8,
                },
            })
            addSVGImageToMap(map)

            map.addSource('point', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [126.39670000000001, 37.4895], // 좌표 설정
                            },
                        },
                    ],
                },
            })

            map.addLayer({
                'id': 'point',
                'source': 'point',
                'type': 'symbol',
                'layout': {
                    'icon-image': 'custom-airport-icon', // 커스텀 아이콘 사용
                    'icon-rotate': ['get', 'bearing'],
                    'icon-rotation-alignment': 'map',
                    'icon-overlap': 'always',
                    'icon-ignore-placement': true,
                },
            })
        }
    }

    const draw2DLine = async () => {
        const map = mapRef.current?.getMap()

        if (!map) {
            alert("Map couldn't be loaded.")
            return
        }

        const pathCoordinates = await interpolatedRawPath(route.path, 500).map(([lat, lon]) => ({ lat, lon }))
        const filteredPathCoordinates = await removeDuplicateCoordinates(pathCoordinates)
        const interpolatedPath = await interpolateGreatCirclePath(filteredPathCoordinates)

        const routeOnMap: FeatureCollection = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: interpolatedPath as number[][], // 보간된 경로 사용
                    },
                },
            ],
        }

        console.log('Generated GeoJSON:', routeOnMap)

        if (map.isStyleLoaded()) {
            addOrUpdateRouteLayer(map, routeOnMap)
        } else {
            map.on('load', () => {
                addOrUpdateRouteLayer(map, routeOnMap)
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
            padding: 150,
            maxZoom: 10,
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


const linearInterpFn = (
    current: [number, number, number, number, number, boolean],
    next: [number, number, number, number, number, boolean],
    step: number, totalSteps: number
) => {
    const lat: number = current[1] + (next[1] - current[1]) * (step / totalSteps)
    const lon: number = current[2] + (next[2] - current[2]) * (step / totalSteps)
    return [lat, lon]
}

const interpolatedRawPath = (path: [number, number, number, number, number, boolean][], threshold: number) => {
    const newpath: number[][] = []
    for (let i = 0; i < path.length - 1; i++) {
        const current = path[i]
        const next = path[i + 1]

        newpath.push([current[1], current[2]])
        const timeDif = Math.abs(current[0] - next[0])
        if (timeDif > threshold) {
            const numNewPoints = Math.ceil(timeDif / threshold)
            // return path
            if (numNewPoints > 1) {
                for (let step = 0; step <= numNewPoints; step++) {
                    const newpoint: number[] = linearInterpFn(current, next, step, numNewPoints)
                    newpath.push(newpoint)
                }
            }
        }
    }

    const [_, finalLat, finalLon] = path[path.length - 1]
    newpath.push([finalLat, finalLon])
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
