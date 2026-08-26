const request = require('supertest');
const app = require('../index');
const pool = require('../db');

describe('Services API', () => {
    test('GET /api/services returns an array of services', async () => {
        const res = await request(app).get('/api/services');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/services returns service objects with expected fields', async () => {
        const res = await request(app).get('/api/services');

        expect(res.statusCode).toEqual(200);

        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('name');
            expect(res.body[0]).toHaveProperty('description');
            expect(res.body[0]).toHaveProperty('category');
            expect(res.body[0]).toHaveProperty('location');
            expect(res.body[0]).toHaveProperty('phone');
            expect(res.body[0]).toHaveProperty('website');
            expect(res.body[0]).toHaveProperty('created_at');
        }
    });

    afterAll(async () => {
        await pool.end();
    });
});