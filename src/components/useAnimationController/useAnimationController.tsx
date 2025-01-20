import { useEffect, useRef, useState } from 'react'
import { MapInstance } from 'react-map-gl'

import { FeatureCollection } from '../../api/flight'
import useBearingWithMovingAverage from './useBearingWithMovingAverage'

const BEARING_LIST_LENGTH = 5

const useMapAnimationController = ({
  map,
  line,
  zoomLevel,
  duration,
}: {
  map: MapInstance | null
  line: FeatureCollection[] | null
  zoomLevel: number
  duration: number
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [mergedLine, setMergedLine] = useState<FeatureCollection | null>(null)
  const [currentFrame, setCurrentFrame] = useState<number>(0)
  const requestRef = useRef<null | number>(null)
  const previousTimeRef = useRef<null | number>(null)
  const { bearing, addBearing, calculateBearing } =
    useBearingWithMovingAverage(BEARING_LIST_LENGTH)

  const handleUpdate = (deltaTime: number) => {
    setCurrentFrame((prevFrame) => {
      const nextFrame = Math.floor(prevFrame + deltaTime * 1)

      if (mergedLine?.features[0]?.geometry.coordinates[nextFrame]) {
        const currentPosition =
          mergedLine.features[0].geometry.coordinates[nextFrame]
        const nextPosition =
          mergedLine.features[0].geometry.coordinates[nextFrame + 1] ||
          currentPosition

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
    // handleStop()
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

  // console.log(map, line, zoomLevel, duration)

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
