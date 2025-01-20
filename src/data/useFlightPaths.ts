import { useEffect, useMemo, useState } from 'react'

import cases from './cases.json'
type PathPoint = [number, number, number, number, number, boolean]

interface FlightPath {
  altitude: number
  heading: number
  isGround: boolean
  latitude: number
  longitude: number
  timestamp: number
}

interface FlightData {
  raw: {
    icao24: string
    callsign: string
    startTime: number
    endTime: number
    path: PathPoint[]
  }
  route: string
}

interface ProcessedFlight {
  callsign: string
  endTime: number
  icao24: string
  path: FlightPath[]
  route: string
  startTime: number
}

export function useFlightPaths() {
  const [flightPaths, setFlightPaths] = useState<ProcessedFlight[]>([])

  useEffect(() => {
    const processedData = (cases as FlightData[]).map((flight) => ({
      route: flight.route,
      callsign: flight.raw.callsign.trim(),
      icao24: flight.raw.icao24,
      startTime: flight.raw.startTime,
      endTime: flight.raw.endTime,
      path: flight.raw.path.map((point) => ({
        timestamp: point[0],
        latitude: point[1],
        longitude: point[2],
        altitude: point[3],
        heading: point[4],
        isGround: point[5],
      })),
    }))

    setFlightPaths(processedData)
  }, [])

  const filterByRoute = (routeName: string) =>
    flightPaths.filter((flight) => flight.route === routeName)

  const filterByCallsign = (callsign: string) =>
    flightPaths.filter((flight) => flight.callsign.includes(callsign))

  const filterByTimeRange = (startTime: number, endTime: number) =>
    flightPaths.filter(
      (flight) => flight.startTime >= startTime && flight.endTime <= endTime
    )

  return {
    flightPaths,
    filterByRoute,
    filterByCallsign,
    filterByTimeRange,
  }
}

// 사용 예시:
/*
const MyComponent = () => {
  const { 
    flightPaths, 
    filterByRoute, 
    filterByCallsign 
  } = useFlightPaths();

  // 인천->파리 경로만 필터링
  const parisFlights = filterByRoute("인천->파리");
  
  // 대한항공(KAL) 항공편만 필터링
  const koreanAirFlights = filterByCallsign("KAL");

  return (
    <Map>
      {parisFlights.map(flight => (
        <FlightPathLayer key={flight.callsign} path={flight.path} />
      ))}
    </Map>
  );
};
*/
