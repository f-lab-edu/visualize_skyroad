import { useEffect, useRef, useState } from 'react'
import { MapInstance } from 'react-map-gl'

import { FeatureCollection } from '../../api/flight'

const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const rad = Math.PI / 180
  const deltaLon = (lon2 - lon1) * rad
  const lat1Rad = lat1 * rad
  const lat2Rad = lat2 * rad

  const y = Math.sin(deltaLon) * Math.cos(lat2Rad)
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLon)

  const bearing = Math.atan2(y, x)
  return ((bearing * 180) / Math.PI + 360) % 360
}

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
  const [bearing, setBearing] = useState<number>(999)
  const [prevBearing, setPrevBearing] = useState<number>(999)
  const requestRef = useRef<null | number>(null)
  const previousTimeRef = useRef<null | number>(null)

  const handleUpdate = (deltaTime: number) => {
    setCurrentFrame((prevFrame) => {
      const nextFrame = Math.floor(prevFrame + deltaTime * 1)

      if (mergedLine?.features[0]?.geometry.coordinates[nextFrame]) {
        const currentPosition =
          mergedLine.features[0].geometry.coordinates[nextFrame]
        const nextPosition =
          mergedLine.features[0].geometry.coordinates[nextFrame + 1] ||
          currentPosition
        const bearing = calculateBearing(
          currentPosition[1],
          currentPosition[0],
          nextPosition[1],
          nextPosition[0]
        )

        if (
          currentFrame !== 0 &&
          bearing === 0 /*&& Math.abs(bearing - prevBearing) > 45*/
        ) {
          setBearing(prevBearing)
        } else {
          setBearing(bearing)
          setPrevBearing(bearing)
        }
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
    handleStop()
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

// const [bearingList, setBearingList] = useState<number[]>(Array(5).fill(999))

// const addBearing = (bearing: number) => {
//   setBearingList((prevList) => {
//     return [...prevList.slice(1), bearing]
//   })
// }
// const draw = (mapInstance: any, position: any, bearing: number) => {
//   if (mapInstance?.getSource('point')) {
//     const point = {
//       type: 'FeatureCollection',
//       features: [
//         {
//           type: 'Feature',
//           properties: {},
//           geometry: {
//             type: 'Point',
//             coordinates: position,
//           },
//         },
//       ],
//     }
//     mapInstance.getSource('point').setData(point)

//     if (!mapInstance.getLayer('points')) {
//       mapInstance.addLayer({
//         id: 'points',
//         type: 'symbol',
//         source: 'point',
//         layout: {
//           'icon-image': 'airplane-icon',
//           'icon-size': 0.75,
//         },
//       })
//     } else {
//       mapInstance.setLayoutProperty('points', 'icon-rotate', bearing)
//     }
//   }
// }

// const animateAtoB = async (mapInstance: any, lineData: any | FeatureCollection) => {
//   if (!lineData) {
//     return
//   }

//   // const origin = lineData?.features[0].geometry.coordinates[0]
//   // const point = {
//   //   type: 'FeatureCollection',
//   //   features: [
//   //     {
//   //       type: 'Feature',
//   //       properties: {},
//   //       geometry: {
//   //         type: 'Point',
//   //         coordinates: origin,
//   //       },
//   //     },
//   //   ],
//   // }

//   // mapInstance.loadImage('/airplane.png', (error: Error, image: HTMLIFrameElement) => {
//   //   if (error) {
//   //     console.error('**에러: ', error)
//   //     throw error
//   //   }

//   //   if (!mapInstance.hasImage('airplane-icon')) {
//   //     mapInstance.addImage('airplane-icon', image)
//   //   }

//   //   if (!mapInstance.getSource('point')) {
//   //     mapInstance.addSource('point', { type: 'geojson', data: point })
//   //   }

//   //   if (!mapInstance.getLayer('points')) {
//   //     mapInstance.addLayer({
//   //       id: 'points',
//   //       type: 'symbol',
//   //       source: 'point',
//   //       index: 2,
//   //       layout: {
//   //         'icon-image': 'airplane-icon',
//   //         'icon-size': .75 * 1 / zoomLevel
//   //       },
//   //     })
//   //   }
//   // })
// }
// const handleUpdate = (deltaTime: number) => {
//   setCurrentFrame((prevFrame) => {

//     const nextFrame = Math.floor(prevFrame + deltaTime * 100)

//     if (mergedLine?.features[0]?.geometry.coordinates[nextFrame]) {
//       const currentPosition = mergedLine.features[0].geometry.coordinates[nextFrame]
//       const nextPosition = mergedLine.features[0].geometry.coordinates[nextFrame + 1] || currentPosition
//       // const bearing = calculateBearing(
//       // currentPosition[1], currentPosition[0],
//       // nextPosition[1], nextPosition[0]
//       // )

//       // draw(map, mergedLine.features[0].geometry.coordinates[nextFrame], bearing)
//     }

//     return nextFrame

//   })
// }
