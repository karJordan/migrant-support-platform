const request = require('supertest');
const app = require('../index');
const pool = require('../db');

let adminToken;
let userToken;

beforeAll(async () => {
    const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'adminpassword123' });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });
    userToken = userLogin.body.token;
});

afterAll(async () => {
    await pool.end();
});

describe('GET /api/admin/users', () => {
    test('rejects non-admin users', async () => {
        const res = await request(app)
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });

    test('admin can view all users', async () => {
        const res = await request(app)
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('email');
    });
});

describe('GET /api/admin/jobs', () => {
    test('rejects an invalid status filter', async () => {
        const res = await request(app)
            .get('/api/admin/jobs?status=bogus')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Invalid status');
    });

    test('defaults to pending jobs when no status is given', async () => {
        const res = await request(app)
            .get('/api/admin/jobs')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('PATCH /api/admin/approve/:type/:id and /api/admin/reject/:type/:id', () => {
    let jobId;

    beforeAll(async () => {
        const createRes = await request(app)
            .post('/api/jobs')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'Admin Test Job', company: 'Test Co', category_id: 1 });
        jobId = createRes.body.id;
    });

    test('rejects an invalid type', async () => {
        const res = await request(app)
            .patch(`/api/admin/approve/notarealtype/${jobId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Invalid type');
    });

    test('non-admin cannot approve', async () => {
        const res = await request(app)
            .patch(`/api/admin/approve/job/${jobId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });

    test('admin can approve the job', async () => {
        const res = await request(app)
            .patch(`/api/admin/approve/job/${jobId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Item approved successfully');
    });

    test('admin can reject the job', async () => {
        const res = await request(app)
            .patch(`/api/admin/reject/job/${jobId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Item rejected successfully');
    });

    test('returns 404 for a non-existent job', async () => {
        const res = await request(app)
            .patch(`/api/admin/approve/job/999999`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(404);
    });

    afterAll(async () => {
        // Clean up the test job so it doesn't clutter real data
        await pool.query('DELETE FROM jobs WHERE id = $1', [jobId]);
    });
});

describe('PATCH /api/admin/users/:id', () => {
    test('rejects an invalid role', async () => {
        const res = await request(app)
            .patch('/api/admin/users/1')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Test', email: 'test@test.com', role: 'superadmin' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Invalid role');
    });

    test('rejects an invalid email', async () => {
        const res = await request(app)
            .patch('/api/admin/users/1')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Test', email: 'not-an-email', role: 'user' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Invalid email address');
    });
});