import { useState } from 'react';
const useBearingWithMovingAverage = (windowSize) => {
    const [_, setBearingList] = useState([]);
    const [bearing, setBearing] = useState(10);
    const calculateBearing = (lat1, lon1, lat2, lon2) => {
        const rad = Math.PI / 180;
        const deltaLon = (lon2 - lon1) * rad;
        const lat1Rad = lat1 * rad;
        const lat2Rad = lat2 * rad;
        const y = Math.sin(deltaLon) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLon);
        const bearing = Math.atan2(y, x);
        return ((bearing * 180) / Math.PI + 360) % 360;
    };
    const smoothBearing = (bearingList) => {
        const validBearings = bearingList.filter((b) => b !== 0);
        const sum = validBearings.reduce((acc, val) => acc + val, 0);
        return validBearings.length > 0 ? sum / validBearings.length : 0;
    };
    const addBearing = (newBearing) => {
        setBearingList((prevList) => {
            const updatedList = [...prevList.slice(-windowSize + 1), newBearing];
            const averagdeBearing = smoothBearing(updatedList);
            setBearing(averagdeBearing);
            return updatedList;
        });
    };
    return { bearing, addBearing, calculateBearing };
};
export default useBearingWithMovingAverage;
