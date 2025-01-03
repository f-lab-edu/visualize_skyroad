import * as d3 from 'd3'
import { useEffect, useState } from 'react'

interface useAltitudeProps {
  route: any
}

export function useAltitude({ route }: useAltitudeProps) {
  const [altitude, setAltitude] = useState<AltitudeGraphData[]>([])

  useEffect(() => {
    if (route)
      getAltitudeFromRoute({
        route,
      }).then(setAltitude)
  }, [route])

  return {
    altitude,
  }
}

export type AltitudeGraphData = {
  time: number
  altitude: number
}

const getAltitudeFromRoute = async ({
  route,
}: {
  route: any
}): Promise<AltitudeGraphData[]> => {
  const rawData = route.path.map((path: any) => ({
    time: path[0], // UNIX timestamp
    altitude: path[3], // Altitude value
  }))

  const sortedData = rawData.sort((a: any, b: any) => a.time - b.time)

  const startTime = (d3.min(sortedData, (d: any) => d.time) ?? 0) as number
  const endTime = (d3.max(sortedData, (d: any) => d.time) ?? 0) as number
  const interval = 60 * 1
  const uniformTimeRange = d3.range(startTime, endTime + interval, interval)

  const timeToAltitude = d3
    .scaleLinear()
    .domain(sortedData.map((d: any) => d.time))
    .range(sortedData.map((d: any) => d.altitude))
    .clamp(true)

  const result = uniformTimeRange.map((time) => ({
    time: time,
    altitude: timeToAltitude(time),
  }))

  return result
}
