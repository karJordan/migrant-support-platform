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
app.use('/api/community', require('../routes/community'));

beforeEach(() => pool.query.mockReset());

describe('GET /api/community/groups', () => {
    test('returns approved groups with joined category', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1, name: 'Wellington Group', status: 'approved', category: 'Cultural' }]
        });

        const res = await request(app).get('/api/community/groups');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(pool.query.mock.calls[0][0]).toContain("status = 'approved'");
    });
});

describe('POST /api/community/groups', () => {
    test('requires name', async () => {
        const res = await request(app).post('/api/community/groups').send({});

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Name is required');
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('admin-created group is auto-approved', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Group', status: 'approved' }] });

        const res = await request(app)
            .post('/api/community/groups')
            .set('x-role', 'admin')
            .send({ name: 'Group' });

        expect(res.status).toBe(201);
        expect(pool.query.mock.calls[0][1]).toContain('approved');
    });

    test('user-created group goes to pending', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Group', status: 'pending' }] });

        const res = await request(app)
            .post('/api/community/groups')
            .set('x-role', 'user')
            .send({ name: 'Group' });

        expect(res.status).toBe(201);
        expect(pool.query.mock.calls[0][1]).toContain('pending');
    });
});

describe('PATCH /api/community/groups/:id', () => {
    test('non-admin cannot edit a group', async () => {
        const res = await request(app)
            .patch('/api/community/groups/1')
            .set('x-role', 'user')
            .send({ name: 'Group' });

        expect(res.status).toBe(403);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('returns 404 when group does not exist', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = await request(app)
            .patch('/api/community/groups/999')
            .set('x-role', 'admin')
            .send({ name: 'Group' });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Community group not found');
    });
});

describe('GET /api/community/events', () => {
    test('returns approved events ordered by date', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1, title: 'Meetup', status: 'approved' }]
        });

        const res = await request(app).get('/api/community/events');

        expect(res.status).toBe(200);
        expect(pool.query.mock.calls[0][0]).toContain('ORDER BY community_events.event_date');
    });
});

describe('POST /api/community/events', () => {
    test('requires title, event_date, and event_time', async () => {
        const res = await request(app).post('/api/community/events').send({ title: 'Meetup' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Title, Event Date, and Event Time are required');
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('admin-created event is auto-approved', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Meetup', status: 'approved' }] });

        const res = await request(app)
            .post('/api/community/events')
            .set('x-role', 'admin')
            .send({ title: 'Meetup', event_date: '2026-10-01', event_time: '12:00' });

        expect(res.status).toBe(201);
        expect(pool.query.mock.calls[0][1]).toContain('approved');
    });
});

describe('PATCH /api/community/events/:id', () => {
    test('non-admin cannot edit an event', async () => {
        const res = await request(app)
            .patch('/api/community/events/1')
            .set('x-role', 'user')
            .send({ title: 'Meetup' });

        expect(res.status).toBe(403);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('returns 404 when event does not exist', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = await request(app)
            .patch('/api/community/events/999')
            .set('x-role', 'admin')
            .send({ title: 'Meetup' });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Community event not found');
    });
});