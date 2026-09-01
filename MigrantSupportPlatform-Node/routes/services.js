const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/users', async (req, res) => {
    try {
        // Execute SQL query to fetch all data
        const result = await pool.query('SELECT * FROM users');

        // Return rows as a JSON response
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        console.log('Request completed');
    }
});
// GET /api/services - Fetch approved services
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM services WHERE status = 'approved' ORDER BY id ASC"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/services - Create a new service
router.post('/', authenticateToken, async (req, res) => {
    const {
        name,
        category,
        description,
        location,
        phone,
        website
    } = req.body;

    if (!name || !category) {
        return res.status(400).json({
            message: 'Name and category are required'
        });
    }

    try {
        const status =
            req.user.role === 'admin'
                ? 'approved'
                : 'pending';

        const result = await pool.query(
            `INSERT INTO services
            (name, category, description, location, phone, website, status, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                name,
                category,
                description,
                location,
                phone,
                website,
                status,
                req.user.id
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});
module.exports = router;