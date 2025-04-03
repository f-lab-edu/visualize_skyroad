import { useEffect, useState } from 'react';
import cases from './cases.json';
export function useFlightPaths() {
    const [flightPaths, setFlightPaths] = useState([]);
    useEffect(() => {
        const processedData = cases.map((flight) => ({
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
        }));
        setFlightPaths(processedData);
    }, []);
    const filterByRoute = (routeName) => flightPaths.filter((flight) => flight.route === routeName);
    const filterByCallsign = (callsign) => flightPaths.filter((flight) => flight.callsign.includes(callsign));
    const filterByTimeRange = (startTime, endTime) => flightPaths.filter((flight) => flight.startTime >= startTime && flight.endTime <= endTime);
    return {
        flightPaths,
        filterByRoute,
        filterByCallsign,
        filterByTimeRange,
    };
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
