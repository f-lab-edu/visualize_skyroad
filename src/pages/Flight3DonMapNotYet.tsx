



import React, { useEffect, useRef } from 'react';
import { Map, Source, Layer, MapRef } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

interface FlightData {
    time: number;
    lat: number;
    lon: number;
    alt: number;
}

// Function to interpolate path using great circle
const interpolateGreatCirclePath = (coordinates: FlightData[]) => {
    const interpolatedCoords = [];

    for (let i = 0; i < coordinates.length - 1; i++) {
        const { lat: lat1, lon: lon1, alt: alt1 } = coordinates[i];
        const { lat: lat2, lon: lon2, alt: alt2 } = coordinates[i + 1];

        // Create great circle route between two points
        const from = [lon1, lat1];
        const to = [lon2, lat2];
        const greatCircle = turf.greatCircle(turf.point(from), turf.point(to), { npoints: 200 });

        // Add altitude data and push to the array
        greatCircle.geometry.coordinates.forEach((coord, idx) => {
            const progress = idx / greatCircle.geometry.coordinates.length;
            const interpolatedAlt = alt1 + (alt2 - alt1) * progress; // Linearly interpolate altitude
            interpolatedCoords.push([...coord, interpolatedAlt]);
        });
    }

    // Add the final point
    const { lat: finalLat, lon: finalLon, alt: finalAlt } = coordinates[coordinates.length - 1];
    interpolatedCoords.push([finalLon, finalLat, finalAlt]);

    return interpolatedCoords;
};

const FlightOnMap: React.FC = () => {
    const mapRef = useRef<MapRef>(null);
    const counterRef = useRef<number>(0);

    const draw3DLine = () => {
        const map = mapRef.current?.getMap();

        if (!map) {
            alert("Map couldn't be loaded.");
            return;
        }

        // 경로 데이터를 입력 (routes 데이터를 사용)
        const pathCoordinates = routes[0].path.map(([time, lat, lon, alt]) => ({ time, lat, lon, alt }));

        // 대권 보간을 적용하여 경로를 생성
        const interpolatedPath = interpolateGreatCirclePath(pathCoordinates as []);
        console.log(interpolatedPath);
        const route = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: interpolatedPath, // 보간된 경로 사용
                    },
                },
            ],
        };

        const point = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: interpolatedPath[0], // 경로의 첫 번째 점에서 시작
                    },
                },
            ],
        };

        if (map.isStyleLoaded()) {
            animateRoute(map, route, point);
        } else {
            map.on('load', () => {
                animateRoute(map, route, point);
            });
        }
    };

    const animateRoute = (map: any, route: any, point: any) => {
        map.addSource('route', {
            type: 'geojson',
            data: route,
            lineMetrics: true, // line-gradient를 사용하기 위해 필요
        });

        map.addSource('point', {
            type: 'geojson',
            data: point,
        });

        map.addLayer({
            id: 'route',
            source: 'route',
            type: 'line',
            paint: {
                'line-width': 4,
                'line-color': [
                    'interpolate',
                    ['linear'],
                    ['line-progress'],
                    0, 'yellow',
                    1, 'red'
                ],
                'line-opacity': 0.8,
                'line-gradient': [
                    'interpolate',
                    ['linear'],
                    ['line-progress'],
                    0, 'blue',
                    1, 'green',
                ],
            },
        });

        map.addLayer({
            id: 'point',
            source: 'point',
            type: 'symbol',
            layout: {
                'icon-image': 'airport-15',
                'icon-rotate': ['get', 'bearing'],
                'icon-rotation-alignment': 'map',
                'icon-overlap': 'always',
                'icon-ignore-placement': true,
            },
        });

        const animate = () => {
            if (!map) return;

            point.features[0].geometry.coordinates = route.features[0].geometry.coordinates[counterRef.current];

            (map.getSource('point') as maplibregl.GeoJSONSource).setData(point);

            if (counterRef.current < route.features[0].geometry.coordinates.length - 1) {
                counterRef.current += 1;
                requestAnimationFrame(animate);
            }
        };

        animate();
    };

    return (
        <>
            <button onClick={draw3DLine}>Draw Flight Path</button>
            <Map
                ref={mapRef}
                mapLib={maplibregl as any}
                initialViewState={{
                    longitude: 126.3967,
                    latitude: 37.4895,
                    zoom: 5,
                    pitch: 60,
                    bearing: -30,
                }}
                style={{ width: '100%', height: '500px' }}
                mapStyle={`https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`}
                antialias={true}
            />
        </>
    );
};

export default FlightOnMap;

