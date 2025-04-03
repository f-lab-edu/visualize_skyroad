import { describe, it, expect } from 'vitest';
describe('Flight API', () => {
    it('항공편 데이터를 가져올 수 있어야 합니다', async () => {
        const response = await fetch('/api/flights/123');
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data).toHaveProperty('id', '123');
        expect(data).toHaveProperty('departure');
        expect(data).toHaveProperty('arrival');
        expect(data).toHaveProperty('path');
        expect(data.departure).toHaveProperty('name', '인천국제공항');
        expect(data.arrival).toHaveProperty('name', '나리타국제공항');
    });
    it('항공편 목록을 가져올 수 있어야 합니다', async () => {
        const response = await fetch('/api/flights');
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(5);
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('departure');
        expect(data[0]).toHaveProperty('arrival');
    });
    it('에러 상황을 처리할 수 있어야 합니다', async () => {
        const response = await fetch('/api/flights/error');
        expect(response.status).toBe(500);
    });
    it('네트워크 지연 상황을 처리할 수 있어야 합니다', async () => {
        const startTime = Date.now();
        const response = await fetch('/api/flights/delay');
        const endTime = Date.now();
        expect(response.status).toBe(200);
        expect(endTime - startTime).toBeGreaterThanOrEqual(2000);
    });
});
