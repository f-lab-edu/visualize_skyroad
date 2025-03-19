import { useEffect, useRef, useState } from 'react'
import { MapInstance } from 'react-map-gl'

import { FeatureCollection } from '../../api/flight'
import useBearingWithMovingAverage from './useBearingWithMovingAverage'

const BEARING_LIST_LENGTH = 5

interface UesMapAnimationControllerProps {
  line: FeatureCollection[] | null
  map: MapInstance | null
  zoomLevel: number
}
const useMapAnimationController = ({
  map,
  line,
  zoomLevel,
}: UesMapAnimationControllerProps) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [mergedLine, setMergedLine] = useState<FeatureCollection | null>(null)
  const [currentFrame, setCurrentFrame] = useState<number>(0)
  const requestRef = useRef<null | number>(null)
  const previousTimeRef = useRef<null | number>(null)
  const { bearing, addBearing, calculateBearing } =
    useBearingWithMovingAverage(BEARING_LIST_LENGTH)

  const calculateSpeed = (coordinates: number[][]): number => {
    if (!coordinates || coordinates.length < 2) return 1
    let totalDistance = 0
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lon1, lat1] = coordinates[i]
      const [lon2, lat2] = coordinates[i + 1]
      const R = 6371 // 지구 반경 (km)
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      totalDistance += R * c
    }
    const baseDistance = 900
    const speed = Math.max(0.5, Math.min(2, baseDistance / totalDistance))

    return speed
  }

  const handleUpdate = (deltaTime: number) => {
    setCurrentFrame((prevFrame) => {
      if (!mergedLine?.features[0]?.geometry.coordinates) return prevFrame

      const coordinates = mergedLine.features[0].geometry.coordinates
      const speed = calculateSpeed(coordinates)
      const nextFrame = Math.floor(prevFrame + deltaTime * speed)

      if (coordinates[nextFrame]) {
        const currentPosition = coordinates[nextFrame]
        const nextPosition = coordinates[nextFrame + 1] || currentPosition

        const calculatedBearing = calculateBearing(
          currentPosition[1],
          currentPosition[0],
          nextPosition[1],
          nextPosition[0]
        )

        addBearing(calculatedBearing)
      } else {
        stop()
      }

      return nextFrame
    })
  }

  const animate = (time: number) => {
    if (previousTimeRef.current !== null) {
      handleUpdate(time - previousTimeRef.current)
    }
    previousTimeRef.current = time

    if (!isPaused) {
      requestRef.current = requestAnimationFrame(animate)
    }

    if (
      mergedLine &&
      currentFrame >= mergedLine.features[0]?.geometry.coordinates.length
    ) {
      stop()
    }
  }

  const mergeFeatureCollectionCoordinates = (
    featureA: FeatureCollection,
    featureB: FeatureCollection | null
  ): FeatureCollection => {
    if (featureB === null) return featureA

    const mergedFeatures = featureA.features.map((feature, index) => {
      const featureBFeature = featureB.features[index]

      if (feature.geometry.type === featureBFeature?.geometry.type) {
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: Array.isArray(feature.geometry.coordinates)
              ? [
                  ...feature.geometry.coordinates,
                  ...featureBFeature.geometry.coordinates,
                ]
              : feature.geometry.coordinates,
          },
        }
      } else {
        return feature
      }
    })

    return {
      type: 'FeatureCollection',
      features: mergedFeatures,
    }
  }

  const handleStart = () => {
    if (map && line) {
      const merged: FeatureCollection =
        line.length > 1
          ? mergeFeatureCollectionCoordinates(line[0], line[1])
          : line[0]

      setMergedLine(merged)
    }
    setCurrentFrame(0)
  }

  const handleStop = () => {
    setCurrentFrame(0)
  }

  const play = () => {
    if (!isPlaying) {
      setIsPlaying(true)
      setIsPaused(false)
      handleStart()
    }
  }

  const pause = () => {
    if (isPlaying) {
      setIsPaused(true)
      setIsPlaying(false)
    }
  }

  const stop = () => {
    setIsPlaying(false)
    setIsPaused(false)
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current)
      requestRef.current = null
    }

    previousTimeRef.current = null
  }

  useEffect(() => {
    if (isPlaying && !isPaused) {
      requestRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [isPlaying, isPaused])

  return {
    bearing,
    mergedLine,
    play,
    pause,
    stop,
    isPlaying,
    isPaused,
    currentFrame,
  }
}

export default useMapAnimationController
