// import React, { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

// const A380test: React.FC = () => {
//     const mountRef = useRef<HTMLDivElement | null>(null);

//     useEffect(() => {
//         // 씬, 카메라, 렌더러 초기화
//         const scene = new THREE.Scene();
//         scene.background = new THREE.Color(0xf0f0f0);

//         const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//         camera.position.set(0, 0, 10);
//         camera.lookAt(0, 0, 0);

//         const renderer = new THREE.WebGLRenderer();
//         renderer.setSize(window.innerWidth, window.innerHeight);

//         if (mountRef.current) {
//             mountRef.current.appendChild(renderer.domElement);
//         }

//         // STL 모델 로드
//         const loader = new STLLoader();
//         loader.load(
//             '/plane.stl',
//             (geometry) => {
//                 const material = new THREE.MeshStandardMaterial({ color: 0xff5533 });
//                 const mesh = new THREE.Mesh(geometry, material);

//                 mesh.scale.set(0.01, 0.01, 0.01);
//                 mesh.position.set(0, 0, 0);
//                 scene.add(mesh);
//             },
//             undefined,
//             (error) => {
//                 console.error('STL 모델 로드 실패:', error);
//             }
//         );

//         // 조명 추가
//         const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
//         directionalLight.position.set(5, 5, 5);
//         scene.add(directionalLight);

//         const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//         scene.add(ambientLight);

//         // 애니메이션 루프
//         const animate = () => {
//             requestAnimationFrame(animate);
//             renderer.render(scene, camera);
//         };
//         animate();

//         // 뷰포트 크기 조정 이벤트 처리
//         const handleResize = () => {
//             const width = window.innerWidth;
//             const height = window.innerHeight;

//             camera.aspect = width / height; // 카메라의 종횡비 업데이트
//             camera.updateProjectionMatrix(); // 카메라 투영 행렬 업데이트
//             renderer.setSize(width, height); // 렌더러 크기 업데이트
//         };

//         window.addEventListener('resize', handleResize);

//         return () => {
//             window.removeEventListener('resize', handleResize);
//             renderer.dispose(); // 렌더러 메모리 해제
//         };
//     }, []);

//     return <div ref={mountRef}></div>;
// };

// const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY
// style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,

import React, { useEffect, useRef } from 'react';
import maplibregl, { Map, CustomLayerInterface } from 'maplibre-gl';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';
import 'maplibre-gl/dist/maplibre-gl.css';
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

const MapWithThreeLayer: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // MapLibre 초기화
        const map = new maplibregl.Map({
            container: mapContainerRef.current!,
            style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
            center: [126.9780, 37.5665], // 서울 좌표
            zoom: 10,
        });

        let scene: THREE.Scene;
        let camera: THREE.PerspectiveCamera;
        let renderer: THREE.WebGLRenderer;
        let mesh: THREE.Mesh;

        const customLayer: CustomLayerInterface = {
            id: 'threejs-layer',
            type: 'custom',
            renderingMode: '3d',
            onAdd: (map: Map, gl: WebGLRenderingContext) => {
                // Three.js 초기화
                scene = new THREE.Scene();
                camera = new THREE.PerspectiveCamera(75, map.getCanvas().width / map.getCanvas().height, 0.1, 1000);
                camera.position.set(0, 0, 10); // 카메라 위치
                camera.lookAt(0, 0, 0);        // 카메라 방향

                renderer = new THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl,
                });
                renderer.autoClear = false;

                // STL 모델 로드
                const loader = new STLLoader();
                loader.load('/plane.stl', (geometry) => {
                    renderer.clear(); // Three.js의 배경 초기화


                    geometry.computeVertexNormals(); // 노말 강제 재계산



                    const material = new THREE.MeshStandardMaterial({ color: 0x555533 });
                    mesh = new THREE.Mesh(
                        // new THREE.BoxGeometry(1, 1, 1),
                        geometry,
                        material);
                    mesh.scale.set(0.1, 0.1, 0.1); // 크기를 작게 설정
                    mesh.position.set(1, 1, 1)
                    scene.add(mesh);

                    // 초기 모델 위치 설정 (서울 중심)
                    const center = map.getCenter();
                    const position = map.project([center.lng, center.lat]);
                    // mesh.position.set(position.x, position.y, 0);
                    console.log(center, position, map.getCenter())
                    // const tempCube = new THREE.Mesh(
                    // new THREE.BoxGeometry(1, 1, 1),
                    // material // new THREE.MeshStandardMaterial({ color: 0x00ff00 })
                    // );
                    // tempCube.position.set(0, 0, 0);
                    // scene.add(tempCube);
                    camera.position.set(0, 0, 20); // 카메라를 모델 앞쪽에 배치
                    camera.lookAt(0, 0, 0);        // 모델 중심을 바라보게 설정
                    console.log('Camera Position:', camera.position);
                    console.log('Mesh Position:', mesh.position);

                    renderer.render(scene, camera);
                    const axesHelper = new THREE.AxesHelper(5); // 크기 5의 축 헬퍼 추가
                    scene.add(axesHelper);

                });

                // 조명 추가
                const light = new THREE.DirectionalLight(0xffffff, 1);
                light.position.set(5, 5, 5);
                scene.add(light);

                const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
                scene.add(ambientLight);
            },

            render: (gl: WebGLRenderingContext, matrix: number[]) => {
                if (!scene || !camera || !renderer || !mesh) return;
                console.log("test")
                renderer.state.reset(); // WebGL 상태 리셋
                renderer.render(scene, camera);
            },
        };

        map.on('load', () => {
            map.addLayer(customLayer);

            map.on('move', () => {
                if (!mesh) return;

                const center = map.getCenter();
                const position = map.project([center.lng, center.lat]);

                // STL 모델이 지도 중심에 따라 움직이도록 설정
                const x = position.x - map.getCanvas().width / 2;
                const y = -(position.y - map.getCanvas().height / 2); // Y축 반전
                mesh.position.set(x, y, 0);

                // 카메라가 항상 모델을 바라보도록 설정
                camera.position.set(x, y, 20);
                camera.lookAt(x, y, 0);
            });
        });

        return () => {
            map.remove();
        };
    }, []);

    return <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }}></div>;
};

export default MapWithThreeLayer;
