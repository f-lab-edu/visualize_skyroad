import { useEffect, useRef, useState } from 'react'
import { MapInstance } from 'react-map-gl'

import { FeatureCollection } from '../../api/flight'

const useMapAnimationController = ({
  duration,
  line,
  map,
}: {
  map: MapInstance | null
  duration: number
  line: FeatureCollection | null
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const requestRef = useRef<null | number>(null)
  const previousTimeRef = useRef<null | number>(null)
  const [currentFrame, setCurrentFrame] = useState<number>(0)

  const draw = (map: any, pos: any) => {
    if (map?.getSource('point')) {
      const origin = pos
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
      map.getSource('point').setData(point)
    }
  }

  const animateAtoB = async (map: any, line: any | FeatureCollection) => {
    const origin = line?.features[0].geometry.coordinates[0]
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

    map.loadImage('/airplane.png', (error: Error, image: HTMLIFrameElement) => {
      if (error) {
        throw error
      }

      !map.hasImage('airplane-icon') && map.addImage('airplane-icon', image)

      !map.getSource('point') &&
        map.addSource('point', { type: 'geojson', data: point })

      !map.getLayer('points') &&
        map.addLayer({
          id: 'points',
          type: 'symbol',
          source: 'point',
          layout: { 'icon-image': 'airplane-icon', 'icon-size': 0.25 },
        })
    })
  }

  const handleUpdate = (deltaTime: number, { speed }: any) => {

    setCurrentFrame((prevFrame) => {
      const nextFrame = prevFrame + 1

      // if (line?.features[0].geometry.coordinates[nextFrame])
      //   draw(map, line?.features[0].geometry.coordinates[nextFrame])

      return nextFrame
    })
  }

  const handleStart = () => {
    animateAtoB(map, line)
  }

  const handleStop = () => {
    setCurrentFrame(0)
    console.log(line)
    // if (line?.features[0].geometry.coordinates[0])
    //   draw(map, line?.features[0].geometry.coordinates[0])
  }

  const play = () => {
    if (!isPlaying) {
      setIsPlaying(true)
      setIsPaused(false)
      // handleStart()
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
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current)
      requestRef.current = null
    }
    previousTimeRef.current = null
    handleStop()
  }

  const animate = (time: number) => {
    if (previousTimeRef.current !== null) {
      handleUpdate(requestRef.current!, { speed: 1 })

    }
    previousTimeRef.current = time
    if (!isPaused) {
      requestRef.current = requestAnimationFrame(animate)
    }
    if (requestRef.current! >= duration) {
      cancelAnimationFrame(requestRef.current!)
    }
  }

  useEffect(() => {
    if (isPlaying && !isPaused)
      requestRef.current = requestAnimationFrame(animate)

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [isPlaying, isPaused])

  return { play, pause, stop, isPlaying, isPaused, currentFrame }
}

export default useMapAnimationController
