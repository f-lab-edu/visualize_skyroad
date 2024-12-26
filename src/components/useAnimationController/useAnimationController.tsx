import { useEffect, useRef, useState } from 'react'
import { MapInstance } from 'react-map-gl'
import { FeatureCollection } from '../../api/flight'

const useMapAnimationController = ({
  duration,
  line,
  map, zoomLevel
}: {
  map: MapInstance | null
  duration: number
  line: FeatureCollection[] | null
  zoomLevel: number
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [mergedLine, setMergedLine] = useState<FeatureCollection | null>(null)
  const requestRef = useRef<null | number>(null)
  const previousTimeRef = useRef<null | number>(null)
  const [currentFrame, setCurrentFrame] = useState<number>(0)

  const draw = (mapInstance: any, position: any) => {
    // console.log("---- draw ----", position)
    if (mapInstance?.getSource('point')) {
      // console.log(position)
      const point = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: position,
            },
          },
        ],
      }
      mapInstance.getSource('point').setData(point)
    }
  }

  const animateAtoB = async (mapInstance: any, lineData: any | FeatureCollection) => {
    if (!lineData) {
      return
    }

    const origin = lineData?.features[0].geometry.coordinates[0]
    const point = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: origin,
          },
        },
      ],
    }

    mapInstance.loadImage('/airplane.png', (error: Error, image: HTMLIFrameElement) => {
      if (error) {
        console.error('**에러: ', error)
        throw error
      }

      if (!mapInstance.hasImage('airplane-icon')) {
        mapInstance.addImage('airplane-icon', image)
      }

      if (!mapInstance.getSource('point')) {
        mapInstance.addSource('point', { type: 'geojson', data: point })
      }

      if (!mapInstance.getLayer('points')) {
        mapInstance.addLayer({
          id: 'points',
          type: 'symbol',
          source: 'point',
          layout: {
            'icon-image': 'airplane-icon',
            'icon-size': .75// * zoomLevel
          },
        })
      }
    })
  }

  const handleUpdate = (deltaTime: number) => {
    // console.log(deltaTime)
    setCurrentFrame((prevFrame) => {

      const nextFrame = Math.floor(prevFrame + deltaTime)

      if (mergedLine?.features[0]?.geometry.coordinates[nextFrame]) {
        draw(map, mergedLine.features[0].geometry.coordinates[nextFrame])
      }

      return nextFrame

    })
  }
  const mergeFeatureCollectionCoordinates = (
    featureA: FeatureCollection,
    featureB: FeatureCollection | null
  ): FeatureCollection => {

    if (featureB === null)
      return featureA
    const mergedFeatures = featureA.features.map((feature, index) => {
      const featureBFeature = featureB.features[index]

      if (feature.geometry.type === featureBFeature?.geometry.type) {
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: Array.isArray(feature.geometry.coordinates)
              ? [...feature.geometry.coordinates, ...featureBFeature.geometry.coordinates]
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
      const merged: FeatureCollection = mergeFeatureCollectionCoordinates(line[0], line[1])
      setMergedLine(merged)
      animateAtoB(map, merged)
    }
  }

  const handleStop = () => {
    setCurrentFrame(0)
    // if (line?.[0]?.features[0]?.geometry.coordinates[0]) {
    // draw(map, line[0].features[0].geometry.coordinates[0])
    // }
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
    handleStop()
  }

  const animate = (time: number) => {
    if (previousTimeRef.current !== null) {
      handleUpdate(time - previousTimeRef.current)
    }
    previousTimeRef.current = time

    if (!isPaused) {
      requestRef.current = requestAnimationFrame(animate)
    }

    if (currentFrame >= duration) {
      stop()
    }
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

  return { play, pause, stop, isPlaying, isPaused, currentFrame }
}

export default useMapAnimationController
