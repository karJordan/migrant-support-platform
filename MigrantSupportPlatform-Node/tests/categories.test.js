const express = require('express');
const request = require('supertest');

jest.mock('../db', () => ({ query: jest.fn() }));
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
    req.user = { id: 1, role: req.headers['x-role'] || 'admin' };
    next();
});
const pool = require('../db');
const app = express();
app.use(express.json());
for (const route of ['services', 'jobs', 'resources', 'community', 'admin']) {
    app.use(`/api/${route}`, require(`../routes/${route}`));
}
const listings = [
    ['services', 'service', { name: 'Clinic' }],
    ['jobs', 'job', { title: 'Nurse', company: 'Clinic' }],
    ['resources', 'resource', { title: 'Guide', link: 'https://example.com' }],
    ['community/groups', 'community', { name: 'Group' }],
    ['community/events', 'community', { title: 'Meetup', event_date: '2026-10-01', event_time: '12:00' }]
];

beforeEach(() => pool.query.mockReset());

// These tests exercise the actual HTTP handlers with a mocked database; no real data is touched.
describe.each(listings)('%s category validation', (route, type, body) => {
    test.each(['post', 'patch'])('%s accepts and normalises a valid category', async method => {
        pool.query.mockResolvedValueOnce({ rows: [{ applies_to: [type] }] })
            .mockResolvedValueOnce({ rows: [{ id: 1, category_id: 7, category: 'Example' }] });
        const res = await request(app)[method](`/api/${route}${method === 'patch' ? '/1' : ''}`)
            .send({ ...body, category_id: '7' });
        expect(res.status).toBe(method === 'post' ? 201 : 200);
        expect(pool.query.mock.calls[0][1]).toEqual([7]);
        expect(res.body).toMatchObject({ category_id: 7, category: 'Example' });
        expect(pool.query.mock.calls[1][0]).toContain('AS category');
    });

    test.each([0, -1, 1.5, 'abc', '', true, [], {}, '1e2', 2147483648])('rejects malformed ID %j without writing', async category_id => {
        const res = await request(app).post(`/api/${route}`).send({ ...body, category_id });
        expect(res.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test.each(['post', 'patch'])('%s rejects unknown and inapplicable categories without writing', async method => {
        for (const rows of [[], [{ applies_to: ['unrelated'] }]]) {
            pool.query.mockReset().mockResolvedValue({ rows });
            const res = await request(app)[method](`/api/${route}${method === 'patch' ? '/1' : ''}`)
                .send({ ...body, category_id: 7 });
            expect(res.status).toBe(400);
            expect(pool.query).toHaveBeenCalledTimes(1);
        }
    });

    test('omitted category on edit preserves the stored category', async () => {
        pool.query.mockResolvedValue({ rows: [{ id: 1, category_id: 7, category: 'Existing' }] });
        const res = await request(app).patch(`/api/${route}/1`).send(body);
        expect(res.status).toBe(200);
        expect(pool.query).toHaveBeenCalledTimes(1);
        const [sql, args] = pool.query.mock.calls[0];
        expect(sql).toContain('ELSE category_id END');
        expect(args.at(-1)).toBe(false);
        expect(res.body.category).toBe('Existing');
    });

    test('explicit null is only accepted for community', async () => {
        pool.query.mockResolvedValue({ rows: [{ id: 1, category_id: null, category: null }] });
        const res = await request(app).patch(`/api/${route}/1`).send({ ...body, category_id: null });
        expect(res.status).toBe(type === 'community' ? 200 : 400);
        if (type === 'community') {
            expect(pool.query.mock.calls[0][1].at(-1)).toBe(true);
            expect(res.body).toMatchObject({ category_id: null, category: null });
        } else expect(pool.query).not.toHaveBeenCalled();
    });

    test('missing category on creation is only accepted for community', async () => {
        pool.query.mockResolvedValue({ rows: [{ id: 1, category_id: null, category: null }] });
        const res = await request(app).post(`/api/${route}`).send(body);
        expect(res.status).toBe(type === 'community' ? 201 : 400);
        if (type !== 'community') expect(pool.query).not.toHaveBeenCalled();
    });

    test('non-admin edits remain forbidden', async () => {
        const res = await request(app).patch(`/api/${route}/1`).set('x-role', 'user')
            .send({ ...body, category_id: 7 });
        expect(res.status).toBe(403);
        expect(pool.query).not.toHaveBeenCalled();
    });
});

test.each(['services', 'jobs', 'resources', 'groups', 'events'])('admin %s returns joined category fields', async route => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, category_id: null, category: null }] });
    const res = await request(app).get(`/api/admin/${route}`);
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ category_id: null, category: null });
    expect(pool.query.mock.calls[0][0]).toContain('LEFT JOIN categories');
});
