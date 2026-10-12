const express = require('express');
const request = require('supertest');
const { validResource } = require('./fixtures');

jest.mock('../db', () => ({ query: jest.fn() }));
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
    req.user = { id: 1, role: req.headers['x-role'] || 'admin' };
    next();
});
jest.mock('../middleware/validateCategory', () => () => (req, res, next) => next());

const pool = require('../db');
const app = express();
app.use(express.json());
app.use('/api/resources', require('../routes/resources'));

// category_id is only here to satisfy the schema; the category lookup is mocked out
const body = { ...validResource, category_id: 1 };

beforeEach(() => pool.query.mockReset());

describe('GET /api/resources', () => {
    test('returns approved resources', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1, title: 'Guide', status: 'approved', category: 'Housing' }]
        });

        const res = await request(app).get('/api/resources');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(pool.query.mock.calls[0][0]).toContain("status = 'approved'");
    });
});

describe('POST /api/resources', () => {
    test('requires title, description and link', async () => {
        const res = await request(app)
            .post('/api/resources')
            .send({ ...body, title: '', description: '', link: '' });

        expect(res.status).toBe(400);
        expect(res.body.errors.title).toBeDefined();
        expect(res.body.errors.description).toBeDefined();
        expect(res.body.errors.link).toBeDefined();
        expect(pool.query).not.toHaveBeenCalled();
    });

    test.each(['javascript:alert(1)', 'ftp://example.com/file', 'not a link'])(
        'rejects the link %s',
        async link => {
            const res = await request(app)
                .post('/api/resources')
                .send({ ...body, link });

            expect(res.status).toBe(400);
            expect(res.body.errors.link).toBeDefined();
            expect(pool.query).not.toHaveBeenCalled();
        }
    );

    test('admin-created resource is auto-approved', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Guide', status: 'approved' }] });

        const res = await request(app)
            .post('/api/resources')
            .set('x-role', 'admin')
            .send(body);

        expect(res.status).toBe(201);
        expect(pool.query.mock.calls[0][1]).toContain('approved');
    });

    test('user-created resource goes to pending', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Guide', status: 'pending' }] });

        const res = await request(app)
            .post('/api/resources')
            .set('x-role', 'user')
            .send(body);

        expect(res.status).toBe(201);
        expect(pool.query.mock.calls[0][1]).toContain('pending');
    });

    test('ignores a status sent in the body', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Guide', status: 'pending' }] });

        await request(app)
            .post('/api/resources')
            .set('x-role', 'user')
            .send({ ...body, status: 'approved' });

        expect(pool.query.mock.calls[0][1]).toContain('pending');
        expect(pool.query.mock.calls[0][1]).not.toContain('approved');
    });
});

describe('PATCH /api/resources/:id', () => {
    test('non-admin cannot edit a resource', async () => {
        const res = await request(app)
            .patch('/api/resources/1')
            .set('x-role', 'user')
            .send(body);

        expect(res.status).toBe(403);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('admin can edit a resource', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Updated Guide' }] });

        const res = await request(app)
            .patch('/api/resources/1')
            .set('x-role', 'admin')
            .send({ ...body, title: 'Updated Guide' });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Updated Guide');
    });

    test('returns 404 when resource does not exist', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = await request(app)
            .patch('/api/resources/999')
            .set('x-role', 'admin')
            .send(body);

        expect(res.status).toBe(404);
    });

    test('rejects an invalid link on edit', async () => {
        const res = await request(app)
            .patch('/api/resources/1')
            .set('x-role', 'admin')
            .send({ ...body, link: 'javascript:alert(1)' });

        expect(res.status).toBe(400);
        expect(res.body.errors.link).toBeDefined();
        expect(pool.query).not.toHaveBeenCalled();
    });
});