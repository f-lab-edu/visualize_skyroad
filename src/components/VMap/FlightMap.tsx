import React, { useEffect, useRef, useState } from 'react'
import * as turf from '@turf/turf'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Map, MapRef } from 'react-map-gl'
import { useLocation, useNavigate } from 'react-router-dom'
import { requestFlightTrack } from '../../data/dataProcessingLayer'
import { FlightPathElement } from "../../api/flight"
import { Airport } from '../../api/airports'
import { styled } from '@stitches/react'
import useAnimationController from '../../components/useAnimationController/useAnimationController'
import VSkyButton from '../Button/VSKyButton'


const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

const ERRORMESSAGE = {
    NOFLIGHTDETAIL: "항공상세정보를 가져오지 못하였습니다."
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

type FeatureCollection = {
    type: 'FeatureCollection'
    features: Feature[]
}

const INTERPOLE_THRESHOLD = 500

const FlightMap: React.FC = ({ }) => {
    const mapRef = useRef<MapRef>(null)
    const location = useLocation()
    const { departure, arrival, flight } = location.state || {}
    const [route, setRoute] = useState(null) as any
    const [line, setLine] = useState<FeatureCollection>(/* todo: explict empty obj */)
    const [currentFrame, setCurrentFrame] = useState<number>(0)
    const [totalFrames, setTotalFrames] = useState<number>(0)
    const navigate = useNavigate()

    const backHome = () => {
        navigate("/")
    }
    if (!departure || !arrival || !flight) {
        return <div style={{ textAlign: "center", margin: "auto" }}>
            <p>
                {ERRORMESSAGE.NOFLIGHTDETAIL}
            </p>
            <VSkyButton onClick={backHome}>첫 페이지</VSkyButton>
        </div>
    }

    const getRoute = async () => {
        const flightRoute = await requestFlightTrack(flight)
        setRoute(flightRoute)
    }

    const drawLineOnRouteLayer = (map: any, routeOnMap: FeatureCollection, option = { name: "route", color: "blue", isDash: false }) => {

        const { name = "route", color = "blue", isDash = false } = option

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

    }

    const animateAtoB = async (map: any, line: FeatureCollection | any/* todo: remove null */) => {

        const origin = line?.features[0].geometry.coordinates[0]
        const point = {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'Point',
                        'coordinates': origin
                    }
                }
            ]
        }

        map.loadImage("/airplane.png", (error: Error, image: HTMLIFrameElement) => {

            if (error) {
                throw error
            }

            !map.hasImage("airplane-icon") &&
                map.addImage("airplane-icon", image)

            !map.getSource("point") &&
                map.addSource("point", { type: "geojson", data: point })

            !map.getLayer("points") &&
                map.addLayer({
                    id: "points", type: "symbol", source: "point", layout: { "icon-image": "airplane-icon", "icon-size": 0.25, },
                })
        })

    }

    const drawStraightLine = async (map: any, line: FeatureCollection) => {

        const option = { name: "straight-line", color: "yellow", isDash: true }

        if (map.isStyleLoaded()) {
            drawLineOnRouteLayer(map, line, option)

        } else {
            map.on('load', () => {
                drawLineOnRouteLayer(map, line, option)
            })

        }

    }

    const fitMapBound = (map: any) => {

        const from = route.path[0]
        const to = route.path[route.path.length - 1]

        const fromPosition: [number, number] = [from[2], from[1]]
        const toPosition: [number, number] = [to[2], to[1]]

        map?.fitBounds([fromPosition, toPosition], {
            padding: 100,
            maxZoom: 5,
        })

        return () => map?.remove()
    }

    const getLineFromRoute = async (): Promise<FeatureCollection> => {
        return new Promise(async (resolve) => {

            const { departure, arrival, }: { departure: Airport, arrival: Airport } = location.state || null

            const timestampStarted = route.path.at(0)[0]// [0]
            const timestampTerminated = route.path.at(-1)[0]
            const unitTime = (timestampTerminated - timestampStarted) / INTERPOLE_THRESHOLD

            const departureAirport: FlightPathElement = {
                time: timestampStarted - unitTime,
                latitude: departure.latitude,
                longitude: departure.longitude,
                baro_altitude: 0,
                true_track: 0,
                on_ground: true
            }
            const arrivalAirport: FlightPathElement = {
                time: timestampTerminated + unitTime,
                latitude: arrival.latitude,
                longitude: arrival.longitude,
                baro_altitude: 0,
                true_track: 0,
                on_ground: true
            }

            const coordinates = await interpolatedRawPath([departureAirport, arrivalAirport], INTERPOLE_THRESHOLD)
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

            resolve(line)

        })
    }

    useEffect(() => {
        if (flight)
            getRoute()

    }, [flight])

    useEffect(() => {
        const map = mapRef.current?.getMap()

        if (map && route) {
            fitMapBound(map)

            getLineFromRoute().then(setLine)

        }

    }, [route])

    useEffect(() => {
        const map = mapRef.current?.getMap()

        if (map && line) {
            setTotalFrames(line?.features[0].geometry.coordinates.length)

            drawStraightLine(map, line)

        }

    }, [line])

    const draw = (map: any, pos: any) => {
        if (map?.getSource("point")) {
            const origin = pos
            const point = {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'Point',
                            'coordinates': origin
                        }
                    }
                ]
            }
            map.getSource("point").setData(point)
        }
    }

    const handleUpdate = (deltaTime: number, { speed }: any) => {
        console.log(deltaTime, speed)
        setCurrentFrame((prevFrame) => {
            const nextFrame = prevFrame + 1
            const map = mapRef.current?.getMap()

            if (line?.features[0].geometry.coordinates[nextFrame])
                draw(map, line?.features[0].geometry.coordinates[nextFrame])

            return nextFrame
        })
    }

    const handleStart = () => {
        const map = mapRef.current?.getMap()
        animateAtoB(map, line)
    }

    const handleStop = () => {
        setCurrentFrame(0)
        const map = mapRef.current?.getMap()
        if (line?.features[0].geometry.coordinates[0])
            draw(map, line?.features[0].geometry.coordinates[0])
    }

    const handleChangeAniSpeed = (e: React.ChangeEvent<HTMLSelectElement>) => {

        alert(e.target.value)

    }

    const { play, pause, stop, isPlaying, isPaused } =
        useAnimationController(handleUpdate, handleStart, handleStop, totalFrames)

    return (<>

        <AnimationControlWrapper>
            <button onClick={play} disabled={isPlaying}>Play</button>
            <button onClick={pause} disabled={isPaused || !isPlaying}>Pause</button>
            <button onClick={stop}>Stop</button>
            <select onChange={handleChangeAniSpeed}>
                <option value={1}>x1</option>
                <option value={10}>x10</option>
                <option value={50}>x50</option>
            </select>
            &nbsp;({currentFrame}/{totalFrames})
        </AnimationControlWrapper>

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


export default FlightMap


const AnimationControlWrapper = styled('div', {
    backgroundColor: "skyblue",
    padding: "5px",
    display: "flex",
    justifyItems: "center",

})

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

const interpolatedRawPath = (path: FlightPathElement[], threshold: number): Promise<FlightPosition[]> => {
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
                        const newpoint: FlightPosition = linearInterpFn(current, next, step, numNewPoints)
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

const removeDuplicateCoordinates = (coordinates: FlightPosition[]): Promise<FlightPosition[]> => {
    return new Promise((resolve) => {

        const removedCoordinates = coordinates.filter((coord, index, self) =>
            index === 0 ||
            coord.lat !== self[index - 1].lat ||
            coord.lon !== self[index - 1].lon
        )

        resolve(removedCoordinates)
    })
}

const interpolateGreatCirclePath = (coordinates: FlightPosition[]): Promise<any[]> => {
    return new Promise((resolve) => {
        const interpolatedCoords: any = []

        for (let i = 0; i < coordinates.length - 1; i++) {

            const { lat: lat1, lon: lon1 } = coordinates[i]
            const { lat: lat2, lon: lon2 } = coordinates[i + 1]

            const from = [lon1, lat1]
            const to = [lon2, lat2]
            const greatCircle = turf.greatCircle(turf.point(from), turf.point(to), { offset: 100, npoints: 200 })

            interpolatedCoords.push(...greatCircle.geometry.coordinates)
        }

        const { lat: finalLat, lon: finalLon } = coordinates[coordinates.length - 1]
        interpolatedCoords.push([finalLon, finalLat])

        resolve(interpolatedCoords)
    })
}
