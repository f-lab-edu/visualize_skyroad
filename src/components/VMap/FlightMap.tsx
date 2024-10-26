import { styled } from '@stitches/react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import React, { useEffect, useRef, useState } from 'react'
import { Map, MapInstance, MapRef } from 'react-map-gl'
import { useLocation, useNavigate } from 'react-router-dom'

import useMapAnimationController from '../../components/useAnimationController/useAnimationController'
import VSkyButton from '../Button/VSKyButton'
import { useLine } from '../useLine'

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

const ERRORMESSAGE = {
  NOFLIGHTDETAIL: '항공상세정보를 가져오지 못하였습니다.',
}
const STRINGS = {
  HOME: '첫 페이지',
}

const FlightMap: React.FC = () => {
  const mapRef = useRef<MapRef>(null)
  const [map, setMap] = useState<MapInstance | null>(null)

  const location = useLocation()
  const { departure, arrival, flight } = location.state || {}

  const navigate = useNavigate()
  const [zoomLevel, setZoomLevel] = useState<number>(0)

  // 1. 라인 획득
  const { line, route, totalFrames } = useLine({
    arrival,
    departure,
    flight,
    map,
  })

  // 2. 라인을 애니메이션으로 그리기
  const { play, pause, stop, isPlaying, isPaused, currentFrame } =
    useMapAnimationController({
      duration: 1000,
      line,
      map,
    })

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
      <div style={{ textAlign: 'center', margin: 'auto' }}>
        <p>{ERRORMESSAGE.NOFLIGHTDETAIL}</p>
        <VSkyButton onClick={backHome}>{STRINGS.HOME}</VSkyButton>
      </div>
    )
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

  useEffect(() => {
    if (map) {
      fitMapBound(map)
    }
  }, [])

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

  const handleChangeAniSpeed = (e: React.ChangeEvent<HTMLSelectElement>) => {
    alert(e.target.value)
  }

  return (
    <Container>
      <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <AnimationControlWrapper>
          <button disabled={isPlaying} onClick={play}>
            Play
          </button>
          <button disabled={isPaused || !isPlaying} onClick={pause}>
            Pause
          </button>
          <button onClick={stop}>Stop</button>
          <select onChange={handleChangeAniSpeed}>
            <option value={1}>x1</option>
            <option value={10}>x10</option>
            <option value={50}>x50</option>
          </select>
          &nbsp;({currentFrame}/{totalFrames})
        </AnimationControlWrapper>

        <Map
          initialViewState={InitialViewStateKR}
          mapLib={maplibregl as any}
          mapStyle={`https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`}
          ref={mapRef}
          style={StyleMap}
        />

        <ZoomIndicator>
          Zoom: {zoomLevel.toFixed(2)}
        </ZoomIndicator>
      </div>
    </Container>
  )
}

export default FlightMap

const AnimationControlWrapper = styled('div', {
  backgroundColor: 'skyblue',
  padding: '5px',
  display: 'flex',
  justifyItems: 'center',
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
  top: 1,
  right: 10,
  background: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  padding: '5px',
  borderRadius: '5px',
})

const InitialViewStateKR = {
  // RKIS
  longitude: 126.3967,
  latitude: 37.4895,
  zoom: 3.5,
}

const StyleMap = { width: '100%', height: '100vh' }
