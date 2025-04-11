import React, { useMemo, useCallback } from 'react'
import { styled } from '@stitches/react'
import { Flight } from '../../types/flight'
import { useSuspenseQuery } from '@tanstack/react-query'
import { FlightList } from '../../types/flight'

const MapContainer = styled('div', {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
})

const FlightPath = styled('path', {
  stroke: '#3b82f6',
  strokeWidth: 2,
  fill: 'none',
  transition: 'opacity 0.3s ease',
  '&:hover': {
    strokeWidth: 3,
    opacity: 0.8,
  },
})

interface FlightMapProps {
  flightData: Flight
  width?: number
  height?: number
}

export const FlightMap: React.FC<FlightMapProps> = React.memo(
  ({ flightData, width = 800, height = 600 }) => {
    // 경로 데이터 메모이제이션
    const pathData = useMemo(() => {
      if (!flightData.path || flightData.path.length < 2) return ''

      const points = flightData.path.map(([longitude, latitude]) => ({
        x: (longitude + 180) * (width / 360),
        y: (90 - latitude) * (height / 180),
      }))

      return points.reduce((path, point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`
        return `${path} L ${point.x} ${point.y}`
      }, '')
    }, [flightData.path, width, height])

    // 툴팁 위치 계산
    const getTooltipPosition = useCallback((event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect()
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
    }, [])

    if (!flightData.path || flightData.path.length < 2) {
      return <div>No flight path data available</div>
    }

    return (
      <MapContainer>
        <svg width={width} height={height}>
          <FlightPath
            d={pathData}
            onMouseMove={(e) => {
              const { x, y } = getTooltipPosition(e)
            }}
          />
        </svg>
      </MapContainer>
    )
  }
)
