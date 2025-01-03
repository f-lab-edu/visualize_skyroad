import { styled } from '@stitches/react'
import maplibregl from 'maplibre-gl'
import React, { useEffect, useRef, useState } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Marker } from 'react-map-gl'
import { Map, MapInstance, MapRef } from 'react-map-gl'
import { useLocation, useNavigate } from 'react-router-dom'

import useMapAnimationController from '../../components/useAnimationController/useAnimationController'
import VSkyButton from '../Button/VSKyButton'
import Graph from '../Graph'
import { useAltitude } from '../useAltitude'
import { useLine } from '../useLine'

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

const ERRORMESSAGE = {
  NOFLIGHTDETAIL: '항공상세정보를 가져오지 못하였습니다.',
}
const STRINGS = {
  HOME: '첫 페이지',
}

const FlightMap: React.FC = ({}) => {
  const mapRef = useRef<MapRef>(null)
  const [map, setMap] = useState<MapInstance | null>(null)

  const location = useLocation()
  const { departure, arrival, flight } = location.state || {}

  const navigate = useNavigate()
  const [zoomLevel, setZoomLevel] = useState<number>(0)

  const [showAltitudeGraph, setShowAltitudeGraph] = useState<boolean>(true)

  const [lockOn, setLockon] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const handleToggleLockOn = () => {
    setLockon(!lockOn)
  }

  // 1. 라인 획득
  const { line, route, totalFrames } = useLine({
    arrival,
    departure,
    flight,
    map,
  })
  const { altitude } = useAltitude({ route })

  // 2. 라인을 애니메이션으로 그리기
  const {
    bearing,
    mergedLine,
    play,
    pause,
    stop,
    isPlaying,
    isPaused,
    currentFrame,
  } = useMapAnimationController({
    duration: 1000,
    line,
    map,
    zoomLevel,
  })

  useEffect(() => {
    setIsLoading(false)
  }, [route, line])

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current?.getMap() as MapInstance
      setMap(map)
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

        mapInstance.easeTo({
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
    alert(`[TODO]${e.target.value}배속으로 변경되었습니다.`)
  }

  const handleToggleGraph = () => {
    setShowAltitudeGraph(!showAltitudeGraph)
  }

  return (
    <>
      <Container>
        {isLoading && !mergedLine && (
          <LoadingOverlay>
            <div className="modal">
              <p className="loadingText">경로데이터를 가져오 있습니다...</p>
            </div>
          </LoadingOverlay>
        )}

        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
          <AnimationControlWrapper>
            <VSkyButton onClick={handleToggleLockOn} toggled={lockOn}>
              📌 {lockOn ? 'Locked On' : 'Locked Off'}{' '}
            </VSkyButton>

            <button disabled={isPlaying} onClick={play}>
              Play
            </button>

            <button disabled={isPaused || !isPlaying} onClick={pause}>
              Pause
            </button>

            <button onClick={stop}>Stop</button>

            <select disabled onChange={handleChangeAniSpeed}>
              <option value={10}>x10</option>
              <option value={50}>x50</option>
              <option value={1}>x1</option>
            </select>

            <div id="frame-indicator">
              <p>
                ({currentFrame}/{totalFrames})
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
                    }}
                  />
                </Marker>
              )}

            <Marker
              latitude={departure.latitude}
              longitude={departure.longitude}
            >
              <img
                alt="airport"
                src="/airport-1.png"
                style={{
                  /*backgroundColor: 'blue', borderRadius: '50%',*/ width: `${2 * getMarkerSize(zoomLevel)}px`,
                  height: `${2 * getMarkerSize(zoomLevel)}px`,
                  zIndex: 1,
                }}
              />
            </Marker>

            <Marker latitude={arrival.latitude} longitude={arrival.longitude}>
              <img
                alt="airport"
                src="/airport-1.png"
                style={{
                  /*backgroundColor: 'blue', borderRadius: '50%',*/ width: `${2 * getMarkerSize(zoomLevel)}px`,
                  height: `${2 * getMarkerSize(zoomLevel)}px`,
                  zIndex: 1,
                }}
              />
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
            <Graph altitude={altitude} onCloseBtnClicked={handleToggleGraph} />
          )}
        </GraphWrapper>
      </Container>
    </>
  )
}

export default FlightMap

const GraphWrapper = styled('div', {
  position: 'fixed',
  bottom: '0',
  left: '0',
  width: '100%',
  transition: 'transform 0.3s ease-in-out',
})

const AnimationControlWrapper = styled('div', {
  backgroundColor: 'skyblue',
  padding: '5px',
  position: 'relative',
  display: 'flex',
  justifyItems: 'center',
  justifyContent: 'center',
  height: '30px',

  button: {
    border: 'none',
    color: 'white',
    padding: '0 20px',
    borderRadius: '15px',
    margin: '0 5px',
    background: '#005A9C',
    fontSize: '0.95rem',
    '&:disabled': {
      background: '#b0b0b0',
      color: '#e0e0e0',
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },

  select: {
    border: '1px solid gray',
    borderRadius: '5px',
    padding: '5px',
    fontSize: '16px',
    backgroundColor: 'white',
    color: 'black',
    margin: '0 5px',
    outline: 'none',
    ':focus': {
      borderColor: 'blue',
      boxShadow: '0 0 5px rgba(0, 0, 255, 0.5)',
    },
  },

  p: {
    color: 'SlateGray',
    fontSize: '.8rem',
    margin: 'auto',
  },

  '#frame-indicator': {
    width: 'max-content',
    display: 'flex',
    justifyItems: 'center',
    justifyContent: 'center',
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
  animation: 'rotateBackground 10s linear infinite', // 애니메이션 추가
  '.LoadingText': {
    fontSize: '2rem',
    marginBottom: '20px',
    color: 'White',
    background: 'skyblue',
    opacity: '0.85',
    padding: '10px 25px',
    borderRadius: '25px',
  },
  backgroundBlendMode: 'overlay',
  backgroundOpacity: '0.9',

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

  top: 5,
  right: 10,
  background: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  padding: '5px',
  borderRadius: '5px',
})

const StyleMap = { width: '100%', height: '100vh' }

const ToggleButton = styled('button', {
  position: 'fixed',
  bottom: '8px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#4A90E2',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 16px',
  cursor: 'pointer',
  zIndex: 1000,
  ':hover': {
    backgroundColor: '#357ABD',
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
  zIndex: 1000,
  '.modal': {
    background: 'white',
    padding: '20px 40px',
    borderRadius: '10px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    fontSize: '1.5rem',
    color: '#333',
  },
})
