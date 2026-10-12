const express = require('express');
const request = require('supertest');
const { validGroup, validEvent } = require('./fixtures');

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

// Category is optional for community groups and events, so the fixtures leave it out

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
        const res = await request(app)
            .post('/api/community/groups')
            .send({ ...validGroup, name: '' });

        expect(res.status).toBe(400);
        expect(res.body.errors.name).toBeDefined();
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('admin-created group is auto-approved', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Group', status: 'approved' }] });

        const res = await request(app)
            .post('/api/community/groups')
            .set('x-role', 'admin')
            .send(validGroup);

        expect(res.status).toBe(201);
        expect(pool.query.mock.calls[0][1]).toContain('approved');
    });

    test('user-created group goes to pending', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Group', status: 'pending' }] });

        const res = await request(app)
            .post('/api/community/groups')
            .set('x-role', 'user')
            .send(validGroup);

        expect(res.status).toBe(201);
        expect(pool.query.mock.calls[0][1]).toContain('pending');
    });
});

describe('PATCH /api/community/groups/:id', () => {
    test('non-admin cannot edit a group', async () => {
        const res = await request(app)
            .patch('/api/community/groups/1')
            .set('x-role', 'user')
            .send(validGroup);

        expect(res.status).toBe(403);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('returns 404 when group does not exist', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = await request(app)
            .patch('/api/community/groups/999')
            .set('x-role', 'admin')
            .send(validGroup);

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
        const res = await request(app)
            .post('/api/community/events')
            .send({ ...validEvent, title: '', event_date: '', event_time: '' });

        expect(res.status).toBe(400);
        expect(res.body.errors.title).toBeDefined();
        expect(res.body.errors.event_date).toBeDefined();
        expect(res.body.errors.event_time).toBeDefined();
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('rejects a past event date on create', async () => {
        const res = await request(app)
            .post('/api/community/events')
            .send({ ...validEvent, event_date: '2020-01-01' });

        expect(res.status).toBe(400);
        expect(res.body.errors.event_date).toBeDefined();
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('admin-created event is auto-approved', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Meetup', status: 'approved' }] });

        const res = await request(app)
            .post('/api/community/events')
            .set('x-role', 'admin')
            .send(validEvent);

        expect(res.status).toBe(201);
        expect(pool.query.mock.calls[0][1]).toContain('approved');
    });
});

describe('PATCH /api/community/events/:id', () => {
    test('non-admin cannot edit an event', async () => {
        const res = await request(app)
            .patch('/api/community/events/1')
            .set('x-role', 'user')
            .send(validEvent);

        expect(res.status).toBe(403);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('admin can edit an event that is already in the past', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Old meetup' }] });

        const res = await request(app)
            .patch('/api/community/events/1')
            .set('x-role', 'admin')
            .send({ ...validEvent, title: 'Old meetup', event_date: '2020-01-01' });

        expect(res.status).toBe(200);
    });

    test('returns 404 when event does not exist', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = await request(app)
            .patch('/api/community/events/999')
            .set('x-role', 'admin')
            .send(validEvent);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Community event not found');
    });
});