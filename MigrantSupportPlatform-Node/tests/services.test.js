const express = require('express');
const request = require('supertest');

jest.mock('../db', () => ({ query: jest.fn() }));
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
    req.user = { id: 1, role: req.headers['x-role'] || 'admin' };
    next();
});
jest.mock('../middleware/validateCategory', () => () => (req, res, next) => next());

const pool = require('../db');
const app = express();
app.use(express.json());
app.use('/api/services', require('../routes/services'));

beforeEach(() => pool.query.mockReset());

describe('GET /api/services', () => {
    test('returns approved services with joined category', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1, name: 'Clinic', status: 'approved', category: 'Healthcare' }]
        });

        const res = await request(app).get('/api/services');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(pool.query.mock.calls[0][0]).toContain("status = 'approved'");
        expect(pool.query.mock.calls[0][0]).toContain('LEFT JOIN categories');
    });

    test('returns empty array when no services exist', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = await request(app).get('/api/services');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
});

describe('POST /api/services', () => {
    test('requires name', async () => {
        const res = await request(app).post('/api/services').send({});

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Name is required');
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('admin-created service is auto-approved', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Clinic', status: 'approved' }] });

        const res = await request(app)
            .post('/api/services')
            .set('x-role', 'admin')
            .send({ name: 'Clinic' });

        expect(res.status).toBe(201);
        expect(pool.query.mock.calls[0][1]).toContain('approved');
    });

    test('user-created service goes to pending', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Clinic', status: 'pending' }] });

        const res = await request(app)
            .post('/api/services')
            .set('x-role', 'user')
            .send({ name: 'Clinic' });

        expect(res.status).toBe(201);
        expect(pool.query.mock.calls[0][1]).toContain('pending');
    });
});

describe('PATCH /api/services/:id', () => {
    test('non-admin cannot edit a service', async () => {
        const res = await request(app)
            .patch('/api/services/1')
            .set('x-role', 'user')
            .send({ name: 'Clinic' });

        expect(res.status).toBe(403);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('admin can edit a service', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Updated Clinic' }] });

        const res = await request(app)
            .patch('/api/services/1')
            .set('x-role', 'admin')
            .send({ name: 'Updated Clinic' });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Updated Clinic');
    });

    test('returns 404 when service does not exist', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = await request(app)
            .patch('/api/services/999')
            .set('x-role', 'admin')
            .send({ name: 'Clinic' });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Service not found');
    });

    test('requires name on edit', async () => {
        const res = await request(app)
            .patch('/api/services/1')
            .set('x-role', 'admin')
            .send({});

        expect(res.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });
});