import React, { useEffect, useRef, useState } from 'react';
import { Map, Source, Layer, MapRef } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

const FlightOnMap = () => {
    const mapRef = useRef<MapRef>(null);
    const counterRef = useRef<number>(0);
    const steps = 500;

    const draw3DLine = () => {
        const map = mapRef.current?.getMap();

        if (!map) {
            alert("ㅠㅡㅠ맵 못가져옴;;;");
            return;
        }

        const origin: [number, number, number] = [-122.414, 37.776, 0]; // 고도 0
        const destination: [number, number, number] = [-77.032, 38.913, 10000]; // 고도 10,000미터

        const route = {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': [origin, destination],
                    },
                },
            ],
        };

        const point = {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'Point',
                        'coordinates': origin,
                    },
                },
            ],
        };

        const lineDistance = turf.length(route.features[0], { units: 'kilometers' });
        const arc: [number, number, number][] = [];

        for (let i = 0; i < lineDistance; i += lineDistance / steps) {
            const segment = turf.along(route.features[0], i, { units: 'kilometers' });
            const altitude = i * (destination[2] / lineDistance); // 고도 계산
            arc.push([...segment.geometry.coordinates.slice(0, 2), altitude] as [number, number, number]);
        }
        route.features[0].geometry.coordinates = arc;

        if (map.isStyleLoaded()) {
            console.log("Map style loaded, running animation immediately.");
            animateRoute(map, route, point);  // 바로 실행
        } else {
            console.log("Waiting for map to load.");
            map.on('load', () => {
                animateRoute(map, route, point);
            });
        }
    };

    const animateRoute = (map: any, route: any, point: any) => {
        map.addSource('route', {
            'type': 'geojson',
            'data': route,
            'lineMetrics': true, // Enable lineMetrics for line-gradient
        });

        map.addSource('point', {
            'type': 'geojson',
            'data': point,
        });

        map.addLayer({
            'id': 'route',
            'source': 'route',
            'type': 'line',
            'paint': {
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
            'id': 'point',
            'source': 'point',
            'type': 'symbol',
            'layout': {
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
            point.features[0].properties.bearing = turf.bearing(
                turf.point(route.features[0].geometry.coordinates[counterRef.current >= steps ? counterRef.current - 1 : counterRef.current]),
                turf.point(route.features[0].geometry.coordinates[counterRef.current >= steps ? counterRef.current : counterRef.current + 1])
            );

            (map.getSource('point') as maplibregl.GeoJSONSource).setData(point);

            if (counterRef.current < steps) {
                requestAnimationFrame(animate);
            }

            counterRef.current += 1;
        };

        animate();
    };


    return (
        <>
            <button onClick={draw3DLine}>+</button>
            <Map
                ref={mapRef}
                mapLib={maplibregl as any}
                initialViewState={{
                    longitude: -100,
                    latitude: 40,
                    zoom: 3.5,
                    pitch: 60, // Higher pitch for more 3D effect
                    bearing: -30,
                }}
                style={{ width: '100%', height: '500px' }}
                mapStyle={`https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`}
                antialias={true}
            >
                <Source
                    id="openmaptiles"
                    type="vector"
                    url={`https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}`}
                >
                    <Layer
                        id="3d-buildings"
                        source="openmaptiles"
                        source-layer="building"
                        type="fill-extrusion"
                        minzoom={15}
                        paint={{
                            'fill-extrusion-color': [
                                'interpolate',
                                ['linear'],
                                ['get', 'render_height'],
                                0, 'lightgray',
                                200, 'royalblue',
                                400, 'lightblue',
                            ],
                            'fill-extrusion-height': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                15,
                                0,
                                16,
                                ['get', 'render_height'],
                            ],
                            'fill-extrusion-base': [
                                'case',
                                ['>=', ['get', 'zoom'], 16],
                                ['get', 'render_min_height'],
                                0,
                            ],
                        }}
                    />
                </Source>
            </Map>
        </>
    );
};

export default FlightOnMap;
