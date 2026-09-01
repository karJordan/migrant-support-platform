const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// GET /api/jobs - Get approved jobs
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM jobs WHERE status = 'approved' ORDER BY id ASC"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/jobs - Create a new job (requires login)
router.post('/', authenticateToken, async (req, res) => {
    const { title, company, location, employment_type, description } = req.body;

    if (!title || !company) {
        return res.status(400).json({ message: 'Title and Company are required' });
    }

    try {
        //Admins get automatically approved, users go to pending
        const status = req.user.role === 'admin' ? 'approved' : 'pending';

        const result = await pool.query(
            'INSERT INTO jobs (title, company, location, employment_type, description, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, company, location, employment_type, description, status, req.user.id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

