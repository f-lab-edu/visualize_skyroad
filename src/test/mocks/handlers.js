import { http, HttpResponse } from 'msw';
// 실제 데이터와 유사한 모의 데이터 생성
const generateMockFlightData = (id) => ({
    id,
    departure: {
        name: '인천국제공항',
        code: 'ICN',
        latitude: 37.4602,
        longitude: 126.4407,
    },
    arrival: {
        name: '나리타국제공항',
        code: 'NRT',
        latitude: 35.7720,
        longitude: 140.3929,
    },
    path: [
        [126.4407, 37.4602],
        [140.3929, 35.7720],
    ],
});
export const handlers = [
    // 항공편 데이터 조회
    http.get('/api/flights/:id', ({ params }) => {
        const id = String(params.id);
        if (!id) {
            return new HttpResponse(null, { status: 400 });
        }
        const flightData = generateMockFlightData(id);
        return HttpResponse.json(flightData);
    }),
    // 항공편 목록 조회
    http.get('/api/flights', () => {
        const flights = Array.from({ length: 5 }, (_, i) => generateMockFlightData(`flight-${i + 1}`));
        return HttpResponse.json(flights);
    }),
    // 에러 상황 테스트를 위한 핸들러
    http.get('/api/flights/error', () => {
        return new HttpResponse(null, { status: 500 });
    }),
    // 네트워크 지연 상황 테스트를 위한 핸들러
    http.get('/api/flights/delay', async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return HttpResponse.json(generateMockFlightData('delayed-flight'));
    }),
];
