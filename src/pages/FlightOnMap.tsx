import React from 'react';
import { Map, Source, Layer } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

const MapComponent = () => {
    return (
        <Map
            mapLib={maplibregl as any}  // maplibre-gl 라이브러리를 사용
            initialViewState={{
                longitude: 126.4407,
                latitude: 37.4602,
                zoom: 5,
                pitch: 45,
                bearing: -17.6,
            }}
            style={{ width: '100%', height: '500px' }}
            mapStyle={`https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`}
            antialias={true}
        >
            {/* 3D 빌딩 레이어 추가 */}
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
    );
};

export default MapComponent;



/* 
import { styled } from "@stitches/react";
import React from "react";
import Map from 'react-map-gl/maplibre';
const FlightOnMapLayoutContainer = styled('div', {
    //
    //
});
const FlightOnMap=()=> {
    return (<FlightOnMapLayoutContainer>
        <header>
            지도페이지
        </header>
        <Map
            initialViewState={{
                // 인천공항
                // 위도 (Latitude): 37.4602° N
                // 경도 (Longitude): 126.4407° E
                longitude: 126.4407,
                latitude: 37.4602,
                zoom: 5
            }}
            style={{ width: 1200, height: 800 }}
            mapStyle="https://api.maptiler.com/maps/basic-v2/style.json?key=DELbBI23SedU1DU4ulOT"
        />
    </FlightOnMapLayoutContainer>);
}
export default FlightOnMap;
*/