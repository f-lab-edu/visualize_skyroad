import { styled } from '@stitches/react'
import maplibregl from 'maplibre-gl'
import React, { useEffect, useRef, useState } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Marker } from 'react-map-gl'
import { Map, MapInstance, MapRef } from 'react-map-gl'
import { useLocation, useNavigate } from 'react-router-dom'

import VSkyButton from '../components/Button/VSKyButton'
import Graph from '../components/Graph'
import { useAltitude } from '../components/useAltitude'
import useMapAnimationController from '../components/useAnimationController/useAnimationController'
import { useLine } from '../components/useLine'

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

const ERRORMESSAGE = {
  NOFLIGHTDETAIL: '항공상세정보를 가져오지 못하였습니다.',
}
const STRINGS = {
  HOME: '첫 페이지',
}

const FlightOnMap: React.FC = ({}) => {
  const mapRef = useRef<MapRef>(null)
  const [map, setMap] = useState<MapInstance | null>(null)

  const location = useLocation()
  const { departure, arrival, flight } = location.state || {}

  const navigate = useNavigate()
  const [zoomLevel, setZoomLevel] = useState<number>(0)

  const [showAltitudeGraph, setShowAltitudeGraph] = useState<boolean>(true)

  const [lockOn, setLockon] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [showIDL, setShowIDL] = useState<boolean>(false)

  const handleToggleLockOn = () => {
    setLockon(!lockOn)
  }
  const { line, route, totalFrames } = useLine({
    arrival,
    departure,
    flight,
    map,
  })
  const { altitude } = useAltitude({ route })
  const {
    bearing,
    mergedLine,
    play,
    pause,
    stop,
    isPlaying,
    isPaused,
    currentFrame,
    setSpeed,
    speedMultiplier,
  } = useMapAnimationController({
    line,
    map,
    zoomLevel,
  })

  useEffect(() => {
    setIsLoading(false)
  }, [route, line])

  useEffect(() => {
    if (mapRef.current) {
      const mapInstance = mapRef.current.getMap()
      setMap(mapInstance)
    }
  }, [mapRef.current])

  const backHome = () => {
    navigate('/')
  }

  if (!departure || !arrival || !flight) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #bfafff, #d0e8f2, #87cefa)',
        }}
      >
        <div
          style={{
            padding: '50px',
            margin: 'auto',
            border: '1px solid black',
            borderRadius: '15px',
            backgroundColor: 'white',
            boxShadow: '10px 6px 12px 1px rgba(50, 50, 255, .2)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '3rem' }}>😿</p>
          <p>{ERRORMESSAGE.NOFLIGHTDETAIL}</p>
          <VSkyButton onClick={backHome}>{STRINGS.HOME}</VSkyButton>
        </div>
      </div>
    )
  }

  const fitMapBound = () => {
    const from = route.path[0]
    const fromPosition: [number, number] = [from[2], from[1]]

    map?.fitBounds([fromPosition, fromPosition], {
      padding: 100,
      maxZoom: 4.5,
    })

    return () => map?.remove()
  }

  useEffect(() => {
    if (map) {
      fitMapBound()
    }
  }, [line !== null])

  useEffect(() => {
    const map = mapRef.current?.getMap()

    if (!map) {
      return
    }

    const handleZoom = () => {
      setZoomLevel(map.getZoom())
    }

    map.on('zoom', handleZoom)

    return () => {
      map.off('zoom', handleZoom)
    }
  }, [mapRef.current])

  useEffect(() => {
    if (lockOn) {
      const mapInstance = mapRef.current?.getMap()

      if (mapInstance) {
        const [longitude, latitude] = mergedLine?.features[0].geometry
          .coordinates[currentFrame] ||
          mergedLine?.features[0].geometry.coordinates[0] || [0, 0]

        mapInstance.flyTo({
          center: [longitude, latitude],
          duration: 200,
        })
      }
    }
  }, [lockOn === true, currentFrame])

  const getMarkerSize = (zoom: number): number => {
    if (zoom < 5) return 10
    if (zoom < 10) return 20
    return 30
  }

  const handleChangeAniSpeed = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const speed = parseFloat(e.target.value)
    setSpeed(speed)
  }

  const handleToggleGraph = () => {
    setShowAltitudeGraph(!showAltitudeGraph)
  }

  useEffect(() => {
    const map = mapRef.current?.getMap()

    if (!map) return

    if (showIDL) {
      if (!map.isStyleLoaded()) {
        map.on('load', () => {
          addIDLAndMeridian(map)
        })
      } else {
        addIDLAndMeridian(map)
      }
    } else {
      removeIDL(map)
    }
  }, [showIDL])

  const handleShowIDLToggle = () => {
    setShowIDL(!showIDL)
  }

  const addIDLAndMeridian = (map: MapInstance) => {
    map.addSource('dateLine', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [180, 90],
            [180, -90],
          ],
        },
        properties: {},
      },
    })

    map.addLayer({
      id: 'dateLine',
      type: 'line',
      source: 'dateLine',
      layout: {},
      paint: {
        'line-color': 'red',
        'line-width': 2,
        'line-dasharray': [2, 2],
      },
    })

    map.addSource('primeMeridian', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 90],
            [0, -90],
          ],
        },
        properties: {},
      },
    })

    map.addLayer({
      id: 'primeMeridian',
      type: 'line',
      source: 'primeMeridian',
      layout: {},
      paint: {
        'line-color': 'blue',
        'line-width': 2,
        'line-dasharray': [2, 2],
      },
    })
  }

  const removeIDL = (map: MapInstance) => {
    map?.getLayer('primeMeridian') && map.removeLayer('primeMeridian')
    map?.getSource('primeMeridian') && map.removeSource('primeMeridian')
    map?.getLayer('dateLine') && map.removeLayer('dateLine')
    map?.getSource('dateLine') && map.removeSource('dateLine')
  }

  return (
    <Container>
      {isLoading && !mergedLine && (
        <LoadingOverlay>
          <div className="modal">
            <p className="loadingText">경로데이터를 가져오고 있습니다...</p>
          </div>
        </LoadingOverlay>
      )}

      <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <AnimationControlWrapper>
          <button disabled={isLoading} onClick={handleShowIDLToggle}>
            날짜변경선&nbsp;{showIDL ? '표시' : '숨김'}
          </button>

          <VSkyButton
            onClick={handleToggleLockOn}
            toggled={lockOn}
            disabled={isLoading}
          >
            📌 {lockOn ? '잠금' : '잠금해제'}
          </VSkyButton>

          <button disabled={isLoading || isPlaying} onClick={play}>
            {isPaused ? '계속 재생' : '재생'}
          </button>

          <button
            disabled={isLoading || !isPlaying}
            onClick={pause}
            style={{
              backgroundColor: isPaused ? '#e67e22' : '#005A9C',
            }}
          >
            일시정지
          </button>

          <button
            disabled={isLoading || (!isPlaying && currentFrame === 0)}
            onClick={stop}
            style={{
              backgroundColor: '#c0392b',
            }}
          >
            처음으로
          </button>

          <select
            disabled={isLoading}
            onChange={handleChangeAniSpeed}
            value={speedMultiplier}
            style={{
              backgroundColor: isLoading ? '#b0b0b0' : 'white',
              color: isLoading
                ? '#e0e0e0'
                : speedMultiplier > 1
                  ? '#e67e22'
                  : 'black',
              fontWeight: speedMultiplier !== 1 ? 'bold' : 'normal',
              border: `1px solid ${speedMultiplier > 1 ? '#e67e22' : 'gray'}`,
            }}
          >
            <option value="0.5">x0.5 </option>
            <option value="1">x1.0 </option>
            <option value="2">x2.0 </option>
            <option value="5">x5.0 </option>
            <option value="10">x10.0 </option>
          </select>

          <div id="frame-indicator">
            <p>
              {currentFrame}/{totalFrames}
              <span
                style={{
                  marginLeft: '8px',
                  color: speedMultiplier > 1 ? '#e67e22' : 'SlateGray',
                  fontWeight: speedMultiplier !== 1 ? 'bold' : 'normal',
                }}
              >
                {speedMultiplier}x
              </span>
            </p>
          </div>
        </AnimationControlWrapper>

        <Map
          initialViewState={{
            longitude: departure?.longitude || 0,
            latitude: departure?.latitude || 0,
            zoom: 4.5,
          }}
          mapLib={maplibregl as any}
          mapStyle={`https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`}
          ref={mapRef}
          style={StyleMap}
        >
          {route?.path.map((pt: number[], index: number) => (
            <Marker
              key={`ut-${pt[0]}-${index}`}
              latitude={pt[1]}
              longitude={pt[2]}
            >
              <div
                style={{
                  backgroundColor: 'red',
                  borderRadius: '50%',
                  width: 3,
                  height: 3,
                  zIndex: 1,
                }}
              />
            </Marker>
          ))}

          {mergedLine &&
            mergedLine?.features[0]?.geometry?.coordinates.length >=
              currentFrame && (
              <Marker
                latitude={
                  mergedLine?.features[0]?.geometry?.coordinates[
                    currentFrame
                  ][1]
                }
                longitude={
                  mergedLine?.features[0]?.geometry?.coordinates[
                    currentFrame
                  ][0]
                }
              >
                <img
                  alt="Airplane"
                  src="/airbus.svg"
                  style={{
                    width: `${5 * getMarkerSize(zoomLevel)}px`,
                    height: `${5 * getMarkerSize(zoomLevel)}px`,
                    transform: `rotate(${bearing}deg)`,
                    filter: `drop-shadow(2px 25px 1px rgba(0,0,0,.4))`,
                  }}
                />
              </Marker>
            )}

          <Marker latitude={departure.latitude} longitude={departure.longitude}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <img
                alt="airport"
                src="/airport-1.png"
                style={{
                  width: `${2 * getMarkerSize(zoomLevel)}px`,
                  height: `${2 * getMarkerSize(zoomLevel)}px`,
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '1px 3px',
                  borderRadius: '3px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                  height: '14px',
                  zIndex: 2,
                  transform: `scale(${Math.max(1, zoomLevel / 5)})`,
                  transformOrigin: 'left center',
                }}
              >
                <img
                  src={`https://flagcdn.com/${departure.flag.toLowerCase()}.svg`}
                  alt={departure.country}
                  style={{ width: '14px', height: '10px', display: 'block' }}
                />
              </div>
            </div>
          </Marker>

          <Marker latitude={arrival.latitude} longitude={arrival.longitude}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <img
                alt="airport"
                src="/airport-1.png"
                style={{
                  width: `${2 * getMarkerSize(zoomLevel)}px`,
                  height: `${2 * getMarkerSize(zoomLevel)}px`,
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '1px 3px',
                  borderRadius: '3px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                  height: '14px',
                  zIndex: 2,
                  transform: `scale(${Math.max(1, zoomLevel / 5)})`,
                  transformOrigin: 'left center',
                }}
              >
                <img
                  src={`https://flagcdn.com/${arrival.flag.toLowerCase()}.svg`}
                  alt={arrival.country}
                  style={{ width: '14px', height: '10px', display: 'block' }}
                />
              </div>
            </div>
          </Marker>
        </Map>

        <ZoomIndicator>Zoom: {zoomLevel.toFixed(2)}</ZoomIndicator>
      </div>

      <GraphWrapper>
        {!showAltitudeGraph && (
          <ToggleButton onClick={handleToggleGraph}>
            Expand Graph ▲
          </ToggleButton>
        )}
        {showAltitudeGraph && (
          <Graph
            altitude={altitude}
            onCloseBtnClicked={handleToggleGraph}
            currentFrame={currentFrame}
            totalFrames={totalFrames}
          />
        )}
      </GraphWrapper>
    </Container>
  )
}

export default FlightOnMap

const GraphWrapper = styled('div', {
  position: 'fixed',
  bottom: '0',
  left: '0',
  width: '100%',
  transition: 'transform 0.3s ease-in-out',
  zIndex: 1000,
  padding: '20px',
  boxSizing: 'border-box',

  '@media (max-width: 768px)': {
    padding: '10px',
  },
})

const AnimationControlWrapper = styled('div', {
  position: 'absolute',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  padding: '6px 8px',
  borderRadius: '25px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
  backdropFilter: 'blur(8px)',
  transition: 'all 0.3s ease',

  '@media (max-width: 768px)': {
    top: '10px',
    padding: '4px 6px',
    gap: '4px',
    flexWrap: 'wrap',
    width: '90%',
    justifyContent: 'center',
  },

  button: {
    border: 'none',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    background: '#4A90E2',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    minWidth: '80px',
    height: '32px',
    justifyContent: 'center',
    fontWeight: '500',

    '&:hover': {
      background: '#357ABD',
    },

    '&:disabled': {
      background: '#b0b0b0',
      color: '#e0e0e0',
      opacity: 0.6,
      cursor: 'not-allowed',
    },

    '@media (max-width: 768px)': {
      minWidth: '32px',
      width: '32px',
      height: '32px',
      padding: '6px',
      fontSize: '0',
      gap: '0',

      '&::before': {
        content: '',
        display: 'block',
        width: '18px',
        height: '18px',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      },

      '&:nth-child(1)::before': {
        backgroundImage: 'url("/icons/date-line.svg")',
      },
      '&:nth-child(2)::before': {
        backgroundImage: 'url("/icons/lock.svg")',
      },
      '&:nth-child(3)::before': {
        backgroundImage: 'url("/icons/play.svg")',
      },
      '&:nth-child(4)::before': {
        backgroundImage: 'url("/icons/pause.svg")',
      },
      '&:nth-child(5)::before': {
        backgroundImage: 'url("/icons/stop.svg")',
      },
      '&:nth-child(6)::before': {
        backgroundImage: 'url("/icons/speed.svg")',
      },
    },
  },

  select: {
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    padding: '4px 8px',
    fontSize: '0.9rem',
    backgroundColor: 'white',
    color: '#333',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '70px',
    height: '32px',

    '@media (max-width: 768px)': {
      minWidth: '60px',
      padding: '4px',
      fontSize: '0.8rem',
    },

    '&:focus': {
      borderColor: '#4A90E2',
      boxShadow: '0 0 0 2px rgba(74, 144, 226, 0.2)',
    },

    '&:disabled': {
      backgroundColor: '#f5f5f5',
      cursor: 'not-allowed',
    },
  },

  '#frame-indicator': {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#333',
    fontSize: '0.85rem',
    fontWeight: '500',
    backgroundColor: '#E8E8E8',
    padding: '4px 8px',
    borderRadius: '20px',
    minWidth: '80px',
    height: '24px',
    justifyContent: 'center',

    '@media (max-width: 768px)': {
      fontSize: '0.8rem',
      gap: '2px',
      minWidth: '60px',
    },

    span: {
      color: '#4A90E2',
    },
  },
})

const Container = styled('div', {
  background: 'linear-gradient(135deg, #9f9fff, #d0e8f2, #87cefa)',
  backgroundSize: '200% 200%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  margin: '0',
  fontFamily: 'Arial, sans-serif',
  animation: 'rotateBackground 10s linear infinite',
  position: 'relative',
  overflow: 'hidden',

  '@media (max-width: 768px)': {
    flexDirection: 'column',
  },

  '@keyframes rotateBackground': {
    '0%': {
      backgroundPosition: '0% 50%',
    },
    '100%': {
      backgroundPosition: '100% 50%',
    },
  },
})

const ZoomIndicator = styled('div', {
  position: 'absolute',
  top: '20px',
  right: '20px',
  background: 'rgba(255, 255, 255, 0.9)',
  color: '#333',
  padding: '8px 16px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(8px)',
  zIndex: 1000,
  fontSize: '0.9rem',
  fontWeight: '500',

  '@media (max-width: 768px)': {
    top: 'auto',
    bottom: '20px',
    right: '20px',
    padding: '6px 12px',
    fontSize: '0.8rem',
  },
})

const StyleMap = {
  width: '100%',
  height: '100vh',
  position: 'relative' as const,
}

const ToggleButton = styled('button', {
  position: 'fixed',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#005A9C',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  padding: '10px 20px',
  cursor: 'pointer',
  zIndex: 1001,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',

  '&:hover': {
    transform: 'translateX(-50%) translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
  },

  '@media (max-width: 768px)': {
    bottom: '10px',
    padding: '8px 16px',
    fontSize: '0.9rem',
  },
})

const LoadingOverlay = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2000,
  backdropFilter: 'blur(8px)',

  '.modal': {
    background: 'white',
    padding: '24px 40px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#333',
    maxWidth: '90%',
    width: '400px',

    '@media (max-width: 768px)': {
      padding: '16px 24px',
      fontSize: '1rem',
      width: '300px',
    },
  },
})
