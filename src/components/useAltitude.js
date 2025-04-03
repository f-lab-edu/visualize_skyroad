import * as d3 from 'd3';
import { useEffect, useState } from 'react';
export function useAltitude({ route }) {
    const [altitude, setAltitude] = useState([]);
    useEffect(() => {
        if (route)
            getAltitudeFromRoute({
                route,
            }).then(setAltitude);
    }, [route]);
    return {
        altitude,
    };
}
const getAltitudeFromRoute = async ({ route, }) => {
    const rawData = route.path.map((path) => ({
        time: path[0], // UNIX timestamp
        altitude: path[3], // Altitude value
    }));
    const sortedData = rawData.sort((a, b) => a.time - b.time);
    const startTime = (d3.min(sortedData, (d) => d.time) ?? 0);
    const endTime = (d3.max(sortedData, (d) => d.time) ?? 0);
    const interval = 60 * 1;
    const uniformTimeRange = d3.range(startTime, endTime + interval, interval);
    const timeToAltitude = d3
        .scaleLinear()
        .domain(sortedData.map((d) => d.time))
        .range(sortedData.map((d) => d.altitude))
        .clamp(true);
    const result = uniformTimeRange.map((time) => ({
        time: time,
        altitude: timeToAltitude(time),
    }));
    return result;
};
