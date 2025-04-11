import { styled } from '@stitches/react'
import * as d3 from 'd3'
import React, { useEffect, useRef, useState } from 'react'

import { AltitudeGraphData } from './useAltitude'

interface GraphProps {
  altitude: AltitudeGraphData[]
  onCloseBtnClicked: () => void
  currentFrame: number
  totalFrames: number
}

const Graph: React.FC<GraphProps> = ({
  altitude,
  onCloseBtnClicked,
  currentFrame,
  totalFrames,
}) => {
  const svgRef = useRef<null | SVGSVGElement>(null)
  const [unit, setUnit] = useState<'ft' | 'km'>('km')
  const timeData = altitude.map((item: any) => new Date(item.time * 1000))
  const altitudeData = altitude.map((item: AltitudeGraphData) => item.altitude)

  const toggleUnit = () => {
    setUnit(unit === 'ft' ? 'km' : 'ft')
  }

  useEffect(() => {
    if (!svgRef.current) return

    const width = 600
    const height = 175
    const margin = { top: 12, right: 24, bottom: 24, left: 48 }

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', '#f8f9fa')
      .style('border-radius', '12px')
      .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.1)')

    svg.selectAll('*').remove()

    const xScale = d3
      .scaleTime()
      .domain([timeData[0], timeData[timeData.length - 1]])
      .range([margin.left, width - margin.right])

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(altitudeData) || 1])
      .range([height - margin.bottom, margin.top])

    // 현재 시간에 따른 테마 색상 결정
    const currentTime =
      timeData[Math.floor((currentFrame / totalFrames) * timeData.length)]
    const currentHour = currentTime?.getHours() || 12 // 기본값 12시로 설정

    const themeColor = '#FF9800'
    const backgroundColor = '#f8f9fa'
    const textColor = '#666666'
    const gridColor = 'rgba(0, 0, 0, 0.1)'
    const axisColor = 'rgba(0, 0, 0, 0.2)'

    // 배경색 업데이트
    svg.style('background-color', backgroundColor)

    // Y축 포맷터 함수 추가
    const formatAltitude = (value: number) => {
      if (unit === 'ft') {
        const feet = Math.round(value * 3.28084)
        return d3.format(',')(feet) + ' ft'
      } else {
        const km = (value / 1000).toFixed(1)
        return km + ' km'
      }
    }

    // 그리드 라인 추가
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(15)
          .tickSize(-height + margin.top + margin.bottom)
          .tickFormat(() => '')
      )
      .call((g) => g.select('.domain').remove())
      .style('stroke', gridColor)
      .style('stroke-dasharray', '2,2')

    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(
        d3
          .axisLeft(yScale)
          .ticks(8)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat(() => '')
      )
      .call((g) => g.select('.domain').remove())
      .style('stroke', gridColor)
      .style('stroke-dasharray', '2,2')

    // X축 스타일링
    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(15)
          .tickFormat((domainValue: d3.NumberValue | Date) =>
            d3.timeFormat('%H:%M')(domainValue as Date)
          )
      )
      .style('color', textColor)
      .style('font-size', '11px')
      .call((g) => g.select('.domain').attr('stroke', axisColor))
      .call((g) => g.selectAll('.tick line').attr('stroke', axisColor))

    // Y축 스타일링
    const yAxis = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(
        d3
          .axisLeft(yScale)
          .ticks(8)
          .tickFormat((d) => formatAltitude(d as number))
      )
      .style('color', textColor)
      .style('font-size', '11px')
      .call((g) => g.select('.domain').attr('stroke', axisColor))
      .call((g) => g.selectAll('.tick line').attr('stroke', axisColor))

    // Y축 클릭 이벤트 추가
    yAxis.selectAll('.tick').on('click', toggleUnit).style('cursor', 'pointer')

    // 그래프 영역 그라데이션 추가
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', `${themeColor}30`)

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', `${themeColor}05`)

    const area = d3
      .area<{ time: Date; altitude: number }>()
      .x((d) => xScale(d.time))
      .y0(height - margin.bottom)
      .y1((d) => yScale(d.altitude))
      .curve(d3.curveMonotoneX)

    svg
      .append('path')
      .datum(
        altitude.map((item: any, i: number) => ({
          time: timeData[i],
          altitude: item.altitude,
        }))
      )
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area as any)

    const line = d3
      .line<{ time: Date; altitude: number }>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.altitude))
      .curve(d3.curveMonotoneX)

    svg
      .append('path')
      .datum(
        altitude.map((item: any, i: number) => ({
          time: timeData[i],
          altitude: item.altitude,
        }))
      )
      .attr('fill', 'none')
      .attr('stroke', themeColor)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 2)
      .attr('d', line as any)

    // 현재 시간을 나타내는 수직선 추가
    svg
      .append('line')
      .attr('x1', xScale(currentTime))
      .attr('y1', margin.top)
      .attr('x2', xScale(currentTime))
      .attr('y2', height - margin.bottom)
      .attr('stroke', themeColor)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3')

    // 현재 시간 표시 추가
    svg
      .append('text')
      .attr('x', xScale(currentTime) + 5)
      .attr('y', margin.top + 15)
      .text(d3.timeFormat('%H:%M')(currentTime))
      .style('fill', themeColor)
      .style('font-size', '11px')
      .style('font-weight', 'bold')
  }, [altitude, currentFrame, totalFrames, unit])

  return (
    <GraphContainer>
      <Header>
        <p>📈 Altitude Graph</p>
        <FoldButton onClick={onCloseBtnClicked}>Fold ▼</FoldButton>
      </Header>
      <svg ref={svgRef}></svg>
    </GraphContainer>
  )
}

export default Graph

const GraphContainer = styled('div', {
  position: 'fixed',
  bottom: '16px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  padding: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  width: '90%',
  maxWidth: '600px',
  height: '200px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

const Header = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 4px',

  p: {
    width: 'max-content',
    fontSize: '0.9rem',
    margin: 0,
    textAlign: 'center',
    color: '#666666',
  },
})

const FoldButton = styled('button', {
  backgroundColor: '#FF9800',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '4px 12px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: '#F57C00',
  },
})
