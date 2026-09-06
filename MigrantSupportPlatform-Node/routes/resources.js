const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// GET /api/resources - Get approved resources
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM resources WHERE status = 'approved' ORDER BY id ASC"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/resources - Create a new resource (requires login)
router.post('/', authenticateToken, async (req, res) => {
    const { title, description, link, category } = req.body;

    if (!title || !link || !category) {
        return res.status(400).json({ message: 'Title, Link, and Category are required' });
    }

    try {
        //Admins automatically get approved, users go to pending
        const status = req.user.role === 'admin' ? 'approved' : 'pending';

        const result = await pool.query(
            'INSERT INTO resources (title, description, link, category, status, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, link, category, status, req.user.id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// PATCH /api/resources/:id - Update an existing resource
router.patch('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Admin access required'
        });
    }

    const { id } = req.params;
    const {
        title,
        description,
        link,
        category
    } = req.body;

    if (!title || !link || !category) {
        return res.status(400).json({
            message: 'Title, Link, and Category are required'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE resources
             SET title = $1,
                 description = $2,
                 link = $3,
                 category = $4
             WHERE id = $5
             RETURNING *`,
            [
                title,
                description,
                link,
                category,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Resource not found'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});
module.exports = router;