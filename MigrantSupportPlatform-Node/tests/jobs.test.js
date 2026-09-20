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
app.use('/api/jobs', require('../routes/jobs'));

beforeEach(() => pool.query.mockReset());

describe('GET /api/jobs', () => {
    test('returns approved jobs with joined category', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1, title: 'Nurse', company: 'Clinic', status: 'approved', category: 'Healthcare' }]
        });

        const res = await request(app).get('/api/jobs');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(pool.query.mock.calls[0][0]).toContain("status = 'approved'");
        expect(pool.query.mock.calls[0][0]).toContain('LEFT JOIN categories');
    });
});

describe('POST /api/jobs', () => {
    test('requires title and company', async () => {
        const res = await request(app).post('/api/jobs').send({ title: 'Nurse' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Title and Company are required');
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('admin-created job is auto-approved', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1, title: 'Nurse', company: 'Clinic', status: 'approved' }]
        });

        const res = await request(app)
            .post('/api/jobs')
            .set('x-role', 'admin')
            .send({ title: 'Nurse', company: 'Clinic' });

        expect(res.status).toBe(201);
        expect(pool.query.mock.calls[0][1]).toContain('approved');
    });

    test('user-created job goes to pending', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1, title: 'Nurse', company: 'Clinic', status: 'pending' }]
        });

        const res = await request(app)
            .post('/api/jobs')
            .set('x-role', 'user')
            .send({ title: 'Nurse', company: 'Clinic' });

        expect(res.status).toBe(201);
        expect(pool.query.mock.calls[0][1]).toContain('pending');
    });
});

describe('PATCH /api/jobs/:id', () => {
    test('non-admin cannot edit a job', async () => {
        const res = await request(app)
            .patch('/api/jobs/1')
            .set('x-role', 'user')
            .send({ title: 'Nurse', company: 'Clinic' });

        expect(res.status).toBe(403);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('admin can edit a job', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1, title: 'Senior Nurse', company: 'Clinic' }]
        });

        const res = await request(app)
            .patch('/api/jobs/1')
            .set('x-role', 'admin')
            .send({ title: 'Senior Nurse', company: 'Clinic' });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Senior Nurse');
    });

    test('returns 404 when job does not exist', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = await request(app)
            .patch('/api/jobs/999')
            .set('x-role', 'admin')
            .send({ title: 'Nurse', company: 'Clinic' });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Job not found');
    });

    test('requires title and company on edit', async () => {
        const res = await request(app)
            .patch('/api/jobs/1')
            .set('x-role', 'admin')
            .send({ title: 'Nurse' });

        expect(res.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });
});