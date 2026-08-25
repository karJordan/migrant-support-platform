const request = require('supertest');
const app = require('../index');
const pool = require("../db");

describe ("Auth API", () => {
    test("POST /api/auth/register - creates a new user", async () => {
        const res = await request(app)
        .post('/api/auth/register')
        .send({
            name: "Test User",
            email: `testuser${Date.now()}@example.com`, // gets unique email each time
            password: "password123",
        });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email');
    });

    test("POST /api/auth/login - reject duplicate email", async () => {
        const email = `dupe${Date.now()}@example.com`;

        await request(app).post('/api/auth/register').send({
            name: "Test User",
            email: email,
            password: "password123",
        });

        const res = await request(app).post('/api/auth/register').send({
            name: "Second User",
            email: email,
            password: "password123",
        });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'User already exists');
    });

    test("POST /api/auth/login - rejects invalid credentials", async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: `nonexistent@example.com`,
            password: "wrongpassword",
        });

        expect(res.statusCode).toEqual(400);
    });

    test(" GET /api/protected - rejects request with no token", async () => {
        const res = await request(app).get('/api/protected');
        expect(res.statusCode).toEqual(401);
    });

    afterAll(async () => {
    await pool.end();
    });
});