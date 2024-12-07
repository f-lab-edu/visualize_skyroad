import { styled } from '@stitches/react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import React, { ButtonHTMLAttributes, useEffect, useRef, useState } from 'react'
import { Map, MapInstance, MapRef } from 'react-map-gl'
import { useLocation, useNavigate } from 'react-router-dom'

import useMapAnimationController from '../../components/useAnimationController/useAnimationController'
import VSkyButton from '../Button/VSKyButton'
import { useLine } from '../useLine'
import * as THREE from 'three'
import * as d3 from 'd3'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';


const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

const ERRORMESSAGE = {
  NOFLIGHTDETAIL: '항공상세정보를 가져오지 못하였습니다.',
}
const STRINGS = {
  HOME: '첫 페이지',
}

interface GraphProps {
  altitude: number[]
}
const Graph: React.FC<GraphProps> = ({ altitude }) => {

  const svgRef = useRef<SVGSVGElement | null>(null)
  const timeData = altitude.map((_, index) => index)

  useEffect(() => {
    if (!svgRef.current)
      return

    const width = 600
    const height = 200
    const margin = { top: 20, right: 30, bottom: 30, left: 40 }

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', '#f9f9f9')

    svg.selectAll('*').remove()

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(timeData) || 1])
      .range([margin.left, width - margin.right])

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(altitude) || 1])
      .range([height - margin.bottom, margin.top])

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(timeData.length))

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))

    const line = d3
      .line<number>()
      .x((_: number, i: number) => xScale(timeData[i]))
      .y((d: number) => yScale(d))

    svg
      .append('path')
      .datum(altitude)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line as any)

  }, [altitude?.length > 0, timeData?.length > 0])


  return <GraphContainer>
    <svg ref={svgRef}></svg>
  </GraphContainer>
}

const FlightMap: React.FC = () => {
  const mapRef = useRef<MapRef>(null)
  const [map, setMap] = useState<MapInstance | null>(null)

  const location = useLocation()
  const { departure, arrival, flight } = location.state || {}

  const navigate = useNavigate()
  const [zoomLevel, setZoomLevel] = useState<number>(0)

  const [showAltitudeGraph, setShowAltitudeGraph] = useState<boolean>(true)

  // 1. 라인 획득
  const { line, altitude, route, totalFrames } = useLine({
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
  // useEffect(() => {
  //   if (!map) return

  //   const customLayer = {
  //     id: '3d-model',
  //     type: 'custom',
  //     camera: new THREE.Camera(),
  //     scene: new THREE.Scene(),
  //     onAdd(map: MapInstance, gl: any) {
  //       const directionalLight = new THREE.DirectionalLight(0xffffff)
  //       directionalLight.position.set(0, -70, 100).normalize()
  //       this.scene.add(directionalLight)
  //       const directionalLight2 = new THREE.DirectionalLight(0xffffff)
  //       directionalLight2.position.set(0, 70, 100).normalize()
  //       this.scene.add(directionalLight2)
  //       const loader = new THREE.S

  //     }
  //   }
  //   map.on('style.load', () => {
  //     map.addLayer(customLayer)
  //   })
  // }, [map])
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

  const handleChangeAniSpeed = (e: React.ChangeEvent<HTMLSelectElement>) => {
    alert(e.target.value)
  }
  const handleClickedGraphCloseButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowAltitudeGraph(!showAltitudeGraph)
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

          <div id='frame-indicator'>
            <p>({currentFrame}/{totalFrames})</p>
          </div>

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

      {altitude.length > 0 && showAltitudeGraph &&
        <Graph altitude={altitude} />
      }

    </Container >
  )
}

export default FlightMap

const GraphContainer = styled('div', {
  position: 'fixed',
  bottom: '16px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  padding: '16px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  width: '90%',
  maxWidth: '600px',
  height: '200px',
  zIndex: 1000,
  '& section': {
    border: '1px solid red',
    overflow: 'auto',
    height: '50px',
  },
  '& header': {
    maxWidth: 'max-content',
    margin: 'auto',
  },
  '& ul': {
    listStyle: 'none',
  }
})

const AnimationControlWrapper = styled('div', {
  backgroundColor: 'skyblue',
  padding: '5px',
  position: 'relative',
  display: 'flex',
  justifyItems: 'center',
  justifyContent: 'center',
  height: '30px',

  'button': {
    border: 'none',
    color: 'white',
    padding: '0 20px',
    borderRadius: '15px',
    margin: '0 5px',
    background: '#005A9C',
    fontSize: '0.95rem',
    '&:disabled': {
      background: '#b0b0b0', // 비활성화된 배경색 (회색 톤)
      color: '#e0e0e0', // 비활성화된 텍스트 색상 (밝은 회색)
      opacity: 0.6, // 흐리게
      cursor: 'not-allowed', // 비활성화된 상태를 나타내는 커서
    }
  },

  'select': {
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

  'p': {
    color: 'SlateGray',
    fontSize: '.8rem',
    margin: 'auto',
  },

  '#frame-indicator': {
    width: 'max-content',
    display: 'flex',
    justifyItems: 'center',
    justifyContent: 'center',
  }
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

const InitialViewStateKR = {
  // IDL
  longitude: -180,
  latitude: 0,
  // // RKIS
  // longitude: 126.3967,
  // latitude: 37.4895,
  zoom: 3.5,
}

const StyleMap = { width: '100%', height: '100vh' }
