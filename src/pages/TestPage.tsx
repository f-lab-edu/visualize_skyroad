import React from 'react'

const Map = () => <>| map | </>
const Controller = () => <>| play / pasue | </>
const Graph = () => <>| altitude | </>
const Indicator = () => <>| indicator zoom | </>

const TestMap: React.FC = () => {
  return (
    <>
      <Controller />
      <Map />
      <Indicator />
      <Graph />
    </>
  )
}
export default TestMap

/*

  출발/도착공항 + 항공편 -> 타임라인 경로, 고도, 프레임

  <컨테이너>
    <컨트롤러패널 />  // 운행시작, 일시정지, 정지
    <지도컴포넌트 />  // 컨트롤러에서 시작버튼 누르면 
    <그래프 />      // 시간별 고도그래프
    <인디케이터 />   // 현재는 줌만 표시
    <토스트 />
  </컨테이너>

    "route": "런던->파리",
    "raw": {
      "icao24": "39e697",      // 항공기 고유식별코드
      "callsign": "AFR1181 ",  // 콜싸인(항공편 식별코드)
      "startTime": 1736538317, // 관측시작시간 유닉스타임
      "endTime": 1736540567,   // 관측종료시간 유닉스타임
      "path": [                // 유닉스타임, 위도, 경도, 고도, 방향, 접지여부
        [1736538317, 51.4649, -0.4585, -304, 269, false],
            ...
        [1736538381, 51.4623, -0.5307, 304, 251, false],
        [1736538382, 51.4621, -0.5315, 304, 250, false],
            ...
      ]
    }
  
*/

// import maplibregl from 'maplibre-gl'
// import React, { useEffect, useRef, useState } from 'react'
// import { Layer, Map, MapRef, Source } from 'react-map-gl'

// import { useFlightPaths } from '../data/useFlightPaths'
// import useGetCurrentLocation from '../features/useGetCurrentLocation'

// const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

// const TestMap: React.FC = () => {
//   const mapRef = useRef<MapRef>(null)
//   const [gridSpacing, setGridSpacing] = useState<number>(10) // 격자 간격 (기본값 10도)
//   const [gridGeoJSON, setGridGeoJSON] = useState<any>(null) // 격자 GeoJSON 데이터
//   const [longitudeLabelsGeoJSON, setLongitudeLabelsGeoJSON] =
//     useState<any>(null) // 경도 레이블 GeoJSON 데이터
//   const { flightPaths } = useFlightPaths()
//   const {
//     latitude: localLat,
//     longitude: localLon,
//     error: gpsError,
//   } = useGetCurrentLocation()

//   const [selectedPaths, setSelectedPaths] = useState<string[]>([])

//   // 지도 초기화 및 위치 설정
//   useEffect(() => {
//     const map = mapRef.current?.getMap()
//     if (map && localLat && localLon) {
//       map.flyTo({
//         center: [localLon, localLat],
//         zoom: 5,
//       })
//     }
//   }, [localLat, localLon])

//   // 격자 생성 함수
//   const generateGrid = (spacing: number) => {
//     const bounds = {
//       minLat: -90,
//       maxLat: 90,
//       minLon: -180,
//       maxLon: 180,
//     }

//     const features = []

//     // 위도와 경도의 격자 라인 생성
//     for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += spacing) {
//       features.push({
//         type: 'Feature',
//         geometry: {
//           type: 'LineString',
//           coordinates: [
//             [bounds.minLon, lat],
//             [bounds.maxLon, lat],
//           ],
//         },
//       })
//     }

//     for (let lon = bounds.minLon; lon <= bounds.maxLon; lon += spacing) {
//       features.push({
//         type: 'Feature',
//         geometry: {
//           type: 'LineString',
//           coordinates: [
//             [lon, bounds.minLat],
//             [lon, bounds.maxLat],
//           ],
//         },
//       })
//     }

//     return {
//       type: 'FeatureCollection',
//       features,
//     }
//   }

//   // 경도 레이블 생성 함수
//   const generateLongitudeLabels = (spacing: number) => {
//     const features = []

//     for (let lon = -180; lon <= 180; lon += spacing) {
//       features.push({
//         type: 'Feature',
//         geometry: {
//           type: 'Point',
//           coordinates: [lon, 0], // 적도(위도 0)에 경도 레이블 표시
//         },
//         properties: {
//           label: `${lon}°`,
//         },
//       })
//     }

//     return {
//       type: 'FeatureCollection',
//       features,
//     }
//   }

//   // 격자 및 경도 레이블 데이터 업데이트
//   useEffect(() => {
//     setGridGeoJSON(generateGrid(gridSpacing))
//     setLongitudeLabelsGeoJSON(generateLongitudeLabels(gridSpacing * 0.6)) // 60% 간격으로 레이블 생성
//   }, [gridSpacing])

//   const togglePath = (callsign: string) => {
//     setSelectedPaths((prev) =>
//       prev.includes(callsign)
//         ? prev.filter((path) => path !== callsign)
//         : [...prev, callsign]
//     )
//   }

//   if (gpsError) {
//     return <div>{gpsError}</div>
//   }

//   return (
//     <div style={{ width: '100%', height: '100vh' }}>
//       {/* 비행 경로 선택 및 격자 간격 조절 UI */}
//       <div
//         style={{
//           position: 'absolute',
//           zIndex: 10,
//           padding: '10px',
//           backgroundColor: 'rgba(255, 255, 255, 0.9)',
//         }}
//       >
//         <div>
//           <label>
//             Grid Spacing: {gridSpacing}°
//             <input
//               max="30"
//               min="1"
//               onChange={(e) => setGridSpacing(Number(e.target.value))}
//               step="1"
//               type="range"
//               value={gridSpacing}
//             />
//           </label>
//         </div>
//         {flightPaths.map((flight) => (
//           <label key={flight.callsign}>
//             <input
//               checked={selectedPaths.includes(flight.callsign)}
//               onChange={() => togglePath(flight.callsign)}
//               type="checkbox"
//             />
//             {flight.route}
//           </label>
//         ))}
//       </div>

//       <Map
//         initialViewState={{
//           longitude: localLon || 0,
//           latitude: localLat || 45,
//           zoom: 4,
//         }}
//         mapLib={maplibregl as any}
//         mapStyle={`https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`}
//         ref={mapRef}
//         style={{ width: '100%', height: '100%' }}
//       >
//         {/* 격자 표시 */}
//         {gridGeoJSON && (
//           <Source data={gridGeoJSON} id="grid" type="geojson">
//             <Layer
//               id="grid-layer"
//               paint={{
//                 'line-color': 'gray',
//                 'line-width': 1,
//                 'line-dasharray': [2, 2],
//               }}
//               type="line"
//             />
//           </Source>
//         )}

//         {/* 경도 레이블 표시 */}
//         {longitudeLabelsGeoJSON && (
//           <Source
//             data={longitudeLabelsGeoJSON}
//             id="longitude-labels"
//             type="geojson"
//           >
//             <Layer
//               id="longitude-labels-layer"
//               layout={{
//                 'text-field': ['get', 'label'],
//                 'text-size': 12,
//                 'text-offset': [0, 1.5],
//                 'text-anchor': 'top',
//               }}
//               paint={{
//                 'text-color': 'blue',
//               }}
//               type="symbol"
//             />
//           </Source>
//         )}

//         {flightPaths
//           .filter((flight) => selectedPaths.includes(flight.callsign))
//           .map((flight) => (
//             <Source
//               data={{
//                 properties: {},
//                 type: 'Feature',
//                 geometry: {
//                   type: 'LineString',
//                   coordinates: flight.path.map((point) => [
//                     point.longitude,
//                     point.latitude,
//                   ]),
//                 },
//               }}
//               id={`flight-path-${flight.callsign}`}
//               key={flight.callsign}
//               type="geojson"
//             >
//               <Layer
//                 id={`flight-path-layer-${flight.callsign}`}
//                 paint={{
//                   'line-color': 'yellow',
//                   'line-width': 3,
//                 }}
//                 type="line"
//               />
//             </Source>
//           ))}
//       </Map>
//     </div>
//   )
// }

// export default TestMap

// import { Pause, Play, RotateCcw } from 'lucide-react'
// import maplibregl from 'maplibre-gl'
// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// import { Layer, Map, MapRef, Marker, Source } from 'react-map-gl'

// const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

// interface RawDataPoint {
//   latitude: number
//   longitude: number
//   time: number
// }

// interface FlightPathData {
//   path: RawDataPoint[]
// }

// interface FlightControls {
//   currentSpeed: number
//   elapsedTime: number
//   isPlaying: boolean
//   progress: number
//   remainingDistance: number
// }

// const ANIMATION_INTERVAL = 100 // ms
// const DEFAULT_SPEED = 300 // km/h

// const flightData: FlightPathData[] = []

// // 상수 정의
// const CONSTANTS = {
//   MIN_SPEED: 100,
//   MAX_SPEED: 1000,
//   SPEED_STEP: 50,
//   DEFAULT_SPEED: 300,
//   ANIMATION_DURATION: 500,
//   MAP_ZOOM: 6,
//   MARKER_SIZE: 24,
// } as const

// // 스타일 정의
// const styles = {
//   controlPanel: {
//     position: 'absolute' as const,
//     top: '10px',
//     left: '10px',
//     zIndex: 10,
//     backgroundColor: 'white',
//     padding: '15px',
//     borderRadius: '8px',
//     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//   },
//   button: {
//     padding: '8px',
//     marginRight: '8px',
//     backgroundColor: '#4A90E2',
//     border: 'none',
//     borderRadius: '4px',
//     color: 'white',
//     cursor: 'pointer',
//   },
//   sliderContainer: {
//     marginTop: '15px',
//   },
//   progressBarContainer: {
//     width: '100%',
//     height: '4px',
//     backgroundColor: '#eee',
//     marginTop: '15px',
//     borderRadius: '2px',
//   },
//   progressBar: (progress: number) => ({
//     width: `${progress * 100}%`,
//     height: '100%',
//     backgroundColor: '#4A90E2',
//     transition: 'width 0.2s ease',
//     borderRadius: '2px',
//   }),
//   infoText: {
//     fontSize: '14px',
//     color: '#666',
//     marginTop: '8px',
//   },
//   rangeInput: {
//     width: '100%',
//     marginTop: '8px',
//   },
// }

// interface RawDataPoint {
//   latitude: number
//   longitude: number
//   time: number
// }

// interface FlightPathData {
//   path: RawDataPoint[]
// }

// interface FlightControls {
//   currentSpeed: number
//   elapsedTime: number
//   isPlaying: boolean
//   progress: number
//   remainingDistance: number
// }

// const calculateDistance = (
//   lat1: number,
//   lon1: number,
//   lat2: number,
//   lon2: number
// ) => {
//   const R = 6371
//   const toRad = (value: number) => (value * Math.PI) / 180
//   const dLat = toRad(lat2 - lat1)
//   const dLon = toRad(lon2 - lon1)
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2)
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
//   return R * c
// }

// const calculateBearing = (
//   lat1: number,
//   lon1: number,
//   lat2: number,
//   lon2: number
// ) => {
//   const toRad = (value: number) => (value * Math.PI) / 180
//   const toDeg = (value: number) => (value * 180) / Math.PI

//   const dLon = toRad(lon2 - lon1)
//   const lat1Rad = toRad(lat1)
//   const lat2Rad = toRad(lat2)

//   const y = Math.sin(dLon) * Math.cos(lat2Rad)
//   const x =
//     Math.cos(lat1Rad) * Math.sin(lat2Rad) -
//     Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)

//   return toDeg(Math.atan2(y, x))
// }

// const PlaneMarker: React.FC<{ bearing: number }> = ({ bearing }) => (
//   <svg
//     fill="none"
//     height={CONSTANTS.MARKER_SIZE}
//     style={{
//       transform: `rotate(${bearing}deg)`,
//       filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
//     }}
//     viewBox="0 0 24 24"
//     width={CONSTANTS.MARKER_SIZE}
//   >
//     <path
//       d="M12 2L8 20L12 17L16 20L12 2Z"
//       fill="#FF4444"
//       stroke="#990000"
//       strokeWidth="1.5"
//     />
//   </svg>
// )

// const TestMap: React.FC = () => {
//   const mapRef = useRef<MapRef>(null)
//   const animationRef = useRef<number>()
//   const lastUpdateRef = useRef<number>(0)

//   const [controls, setControls] = useState<FlightControls>({
//     isPlaying: false,
//     progress: 0,
//     currentSpeed: CONSTANTS.DEFAULT_SPEED,
//     remainingDistance: 0,
//     elapsedTime: 0,
//   })

//   const [position, setPosition] = useState<{
//     coords: [number, number]
//     bearing: number
//   }>({
//     coords: [flightData.path[0].longitude, flightData.path[0].latitude],
//     bearing: 0,
//   })

//   const { totalDistance, segmentDistances, bounds } = useMemo(() => {
//     const distances: number[] = []
//     let total = 0
//     let maxLng = -Infinity,
//       minLng = Infinity
//     let maxLat = -Infinity,
//       minLat = Infinity

//     for (let i = 0; i < flightData.path.length - 1; i++) {
//       const distance = calculateDistance(
//         flightData.path[i].latitude,
//         flightData.path[i].longitude,
//         flightData.path[i + 1].latitude,
//         flightData.path[i + 1].longitude
//       )
//       distances.push(distance)
//       total += distance

//       minLng = Math.min(minLng, flightData.path[i].longitude)
//       maxLng = Math.max(maxLng, flightData.path[i].longitude)
//       minLat = Math.min(minLat, flightData.path[i].latitude)
//       maxLat = Math.max(maxLat, flightData.path[i].latitude)
//     }

//     return {
//       totalDistance: total,
//       segmentDistances: distances,
//       bounds: [
//         [minLng, minLat],
//         [maxLng, maxLat],
//       ],
//     }
//   }, [])

//   const calculateFrame = useCallback(
//     (elapsed: number) => {
//       const totalTime = (totalDistance / controls.currentSpeed) * (60 * 60)
//       const progress = Math.min(1, elapsed / totalTime)

//       if (progress >= 1) {
//         setControls((prev) => ({ ...prev, isPlaying: false }))
//         return null
//       }

//       let distanceCovered = totalDistance * progress
//       let currentSegment = 0

//       while (
//         distanceCovered > segmentDistances[currentSegment] &&
//         currentSegment < segmentDistances.length
//       ) {
//         distanceCovered -= segmentDistances[currentSegment]
//         currentSegment++
//       }

//       if (currentSegment < segmentDistances.length) {
//         const segmentProgress =
//           distanceCovered / segmentDistances[currentSegment]
//         const start = flightData.path[currentSegment]
//         const end = flightData.path[currentSegment + 1]

//         const newLat =
//           start.latitude + (end.latitude - start.latitude) * segmentProgress
//         const newLng =
//           start.longitude + (end.longitude - start.longitude) * segmentProgress
//         const bearing = calculateBearing(
//           start.latitude,
//           start.longitude,
//           end.latitude,
//           end.longitude
//         )

//         return {
//           position: {
//             coords: [newLng, newLat] as [number, number],
//             bearing,
//           },
//           progress,
//           remainingDistance: totalDistance * (1 - progress),
//         }
//       }

//       return null
//     },
//     [segmentDistances, totalDistance, controls.currentSpeed]
//   )

//   useEffect(() => {
//     if (!controls.isPlaying) return

//     let startTime = performance.now() - controls.elapsedTime * 1000

//     const animate = (currentTime: number) => {
//       const elapsed = (currentTime - startTime) / 1000
//       const frame = calculateFrame(elapsed)

//       if (frame) {
//         setPosition(frame.position)
//         setControls((prev) => ({
//           ...prev,
//           progress: frame.progress,
//           remainingDistance: frame.remainingDistance,
//           elapsedTime: elapsed,
//         }))

//         if (currentTime - lastUpdateRef.current > 16) {
//           if (mapRef.current) {
//             mapRef.current.flyTo({
//               center: frame.position.coords,
//               duration: CONSTANTS.ANIMATION_DURATION,
//             })
//           }
//           lastUpdateRef.current = currentTime
//         }

//         animationRef.current = requestAnimationFrame(animate)
//       }
//     }

//     animationRef.current = requestAnimationFrame(animate)

//     return () => {
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current)
//       }
//     }
//   }, [controls.isPlaying, calculateFrame])

//   const handlePlayPause = () => {
//     setControls((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
//   }

//   const handleReset = () => {
//     setControls({
//       isPlaying: false,
//       progress: 0,
//       currentSpeed: CONSTANTS.DEFAULT_SPEED,
//       remainingDistance: totalDistance,
//       elapsedTime: 0,
//     })
//     setPosition({
//       coords: [flightData.path[0].longitude, flightData.path[0].latitude],
//       bearing: 0,
//     })

//     if (mapRef.current) {
//       mapRef.current.fitBounds(bounds, { padding: 50, duration: 1000 })
//     }
//   }

//   return (
//     <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
//       {/*
//         <div style={styles.controlPanel}>
//         <div>
//           <button onClick={handlePlayPause} style={styles.button}>
//             {controls.isPlaying ? <Pause size={20} /> : <Play size={20} />}
//           </button>
//           <button onClick={handleReset} style={styles.button}>
//             <RotateCcw size={20} />
//           </button>
//         </div>

//         <div style={styles.sliderContainer}>
//           <label>
//             Speed: {controls.currentSpeed} km/h
//             <input
//               max={CONSTANTS.MAX_SPEED}
//               min={CONSTANTS.MIN_SPEED}
//               onChange={(e) =>
//                 setControls((prev) => ({
//                   ...prev,
//                   currentSpeed: Number(e.target.value),
//                 }))
//               }
//               step={CONSTANTS.SPEED_STEP}
//               style={styles.rangeInput}
//               type="range"
//               value={controls.currentSpeed}
//             />
//           </label>
//         </div>

//         <div style={styles.progressBarContainer}>
//           <div style={styles.progressBar(controls.progress)} />
//         </div>

//         <div style={styles.infoText}>
//           Distance: {Math.round(totalDistance - controls.remainingDistance)}/
//           {Math.round(totalDistance)} km
//         </div>
//         <div style={styles.infoText}>
//           Time: {Math.floor(controls.elapsedTime / 60)}:
//           {Math.floor(controls.elapsedTime % 60)
//             .toString()
//             .padStart(2, '0')}
//         </div>
//       </div> */}

//       <Map
//         initialViewState={{
//           longitude: flightData.path[0].longitude,
//           latitude: flightData.path[0].latitude,
//           zoom: CONSTANTS.MAP_ZOOM,
//         }}
//         mapLib={maplibregl}
//         mapStyle={`https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`}
//         ref={mapRef}
//         style={{ width: '100%', height: '100vh' }}
//       >
//         <Source
//           data={{
//             type: 'Feature',
//             geometry: {
//               type: 'LineString',
//               coordinates: flightData.path.map((point) => [
//                 point.longitude,
//                 point.latitude,
//               ]),
//             },
//             properties: {},
//           }}
//           id="flight-path"
//           type="geojson"
//         >
//           <Layer
//             id="flight-path-layer"
//             paint={{
//               'line-color': 'yellow',
//               'line-width': 3,
//             }}
//             type="line"
//           />
//         </Source>

//         <Marker
//           // anchor="center"
//           latitude={position.coords[1]}
//           longitude={position.coords[0]}
//         >
//           <PlaneMarker bearing={position.bearing} />
//         </Marker>
//       </Map>
//     </div>
//   )
// }

// export default TestMap
