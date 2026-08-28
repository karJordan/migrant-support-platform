const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// GET /api/resources - Get all resources
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM resources ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/resources - Create a new resource (requires login)
router.post('/', authenticateToken, async (req, res) => {
    const { title, description, link } = req.body;

    if (!title || !link) {
        return res.status(400).json({ message: 'Title and Link are required' });
    }

    try {
        //Admins automatically get approved, users go to pending
        const status = req.user.role === 'admin' ? 'approved' : 'pending';

        const result = await pool.query(
            'INSERT INTO resources (title, description, link, category, status, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, link, category, status, req.user.id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;