import { Pause, Play, RotateCcw } from 'lucide-react'
import maplibregl from 'maplibre-gl'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Layer, Map, MapRef, Marker, Source } from 'react-map-gl'

interface RawDataPoint {
  latitude: number
  longitude: number
  time: number
}

interface FlightPathData {
  path: RawDataPoint[]
}

interface FlightControls {
  currentSpeed: number
  elapsedTime: number
  isPlaying: boolean
  progress: number
  remainingDistance: number
}

const ANIMATION_INTERVAL = 100 // ms
const DEFAULT_SPEED = 300 // km/h

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const FlightMap: React.FC<{ flightData: FlightPathData }> = ({
  flightData,
}) => {
  const mapRef = useRef<MapRef>(null)
  const animationRef = useRef<number>()

  const [controls, setControls] = useState<FlightControls>({
    isPlaying: false,
    progress: 0,
    currentSpeed: DEFAULT_SPEED,
    remainingDistance: 0,
    elapsedTime: 0,
  })

  const [position, setPosition] = useState<[number, number]>([
    flightData.path[0].longitude,
    flightData.path[0].latitude,
  ])

  // 경로 거리 계산을 메모이제이션
  const { totalDistance, segmentDistances } = useMemo(() => {
    const distances: number[] = []
    let total = 0

    for (let i = 0; i < flightData.path.length - 1; i++) {
      const distance = calculateDistance(
        flightData.path[i].latitude,
        flightData.path[i].longitude,
        flightData.path[i + 1].latitude,
        flightData.path[i + 1].longitude
      )
      distances.push(distance)
      total += distance
    }

    return { totalDistance: total, segmentDistances: distances }
  }, [flightData.path])

  // 애니메이션 프레임 계산
  const calculateFrame = useCallback(
    (elapsed: number) => {
      const totalTime = (totalDistance / controls.currentSpeed) * (60 * 60)
      const progress = Math.min(1, elapsed / totalTime)

      if (progress >= 1) {
        setControls((prev) => ({ ...prev, isPlaying: false }))
        return null
      }

      let distanceCovered = totalDistance * progress
      let currentSegment = 0
      let segmentProgress = 0

      // 현재 세그먼트 찾기
      while (
        distanceCovered > segmentDistances[currentSegment] &&
        currentSegment < segmentDistances.length
      ) {
        distanceCovered -= segmentDistances[currentSegment]
        currentSegment++
      }

      if (currentSegment < segmentDistances.length) {
        segmentProgress = distanceCovered / segmentDistances[currentSegment]
        const start = flightData.path[currentSegment]
        const end = flightData.path[currentSegment + 1]

        const newLat =
          start.latitude + (end.latitude - start.latitude) * segmentProgress
        const newLng =
          start.longitude + (end.longitude - start.longitude) * segmentProgress

        return {
          position: [newLng, newLat] as [number, number],
          progress,
          remainingDistance: totalDistance * (1 - progress),
        }
      }

      return null
    },
    [flightData.path, segmentDistances, totalDistance, controls.currentSpeed]
  )

  // 애니메이션 제어
  useEffect(() => {
    if (!controls.isPlaying) return

    let startTime = performance.now() - controls.elapsedTime * 1000

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000
      const frame = calculateFrame(elapsed)

      if (frame) {
        setPosition(frame.position)
        setControls((prev) => ({
          ...prev,
          progress: frame.progress,
          remainingDistance: frame.remainingDistance,
          elapsedTime: elapsed,
        }))

        // 맵 뷰 업데이트
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: frame.position,
            duration: 500,
          })
        }

        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [controls.isPlaying, calculateFrame])

  const handlePlayPause = () => {
    setControls((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const handleReset = () => {
    setControls({
      isPlaying: false,
      progress: 0,
      currentSpeed: DEFAULT_SPEED,
      remainingDistance: totalDistance,
      elapsedTime: 0,
    })
    setPosition([flightData.path[0].longitude, flightData.path[0].latitude])

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [flightData.path[0].longitude, flightData.path[0].latitude],
        zoom: 6,
        duration: 1000,
      })
    }
  }

  return (
    <div className="relative w-full h-screen">
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              onClick={handlePlayPause}
            >
              {controls.isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              className="p-2 rounded bg-gray-500 text-white hover:bg-gray-600"
              onClick={handleReset}
            >
              <RotateCcw size={20} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Speed: {controls.currentSpeed} km/h
              <input
                className="w-full mt-1"
                max="1000"
                min="100"
                onChange={(e) =>
                  setControls((prev) => ({
                    ...prev,
                    currentSpeed: Number(e.target.value),
                  }))
                }
                step="50"
                type="range"
                value={controls.currentSpeed}
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-full bg-blue-500 rounded"
                style={{ width: `${controls.progress * 100}%` }}
              />
            </div>
            <div className="text-sm text-gray-600">
              Remaining: {Math.round(controls.remainingDistance)} km
            </div>
            <div className="text-sm text-gray-600">
              Time: {Math.floor(controls.elapsedTime / 60)}:
              {Math.floor(controls.elapsedTime % 60)
                .toString()
                .padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <Map
        initialViewState={{
          longitude: flightData.path[0].longitude,
          latitude: flightData.path[0].latitude,
          zoom: 6,
        }}
        mapLib={maplibregl as any}
        mapStyle={`https://api.maptiler.com/maps/basic-v2/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`}
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
      >
        <Source
          data={{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: flightData.path.map((point) => [
                point.longitude,
                point.latitude,
              ]),
            },
            properties: {},
          }}
          id="flight-path"
          type="geojson"
        >
          <Layer
            id="flight-path-layer"
            paint={{
              'line-color': '#3b82f6',
              'line-width': 3,
              'line-opacity': 0.8,
            }}
            type="line"
          />
        </Source>

        <Marker anchor="center" latitude={position[1]} longitude={position[0]}>
          <div
            className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-red-500"
            style={{
              transform: 'rotate(180deg)',
              filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))',
            }}
          />
        </Marker>
      </Map>
    </div>
  )
}

export default FlightMap
