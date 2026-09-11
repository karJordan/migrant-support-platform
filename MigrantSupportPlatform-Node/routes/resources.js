const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const validateCategory = require('../middleware/validateCategory');

// GET /api/resources - Get approved resources
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                resources.id,
                resources.title,
                resources.description,
                resources.link,
                resources.status,
                resources.created_at,
                resources.category_id,
                categories.name AS category
            FROM resources
            LEFT JOIN categories ON resources.category_id = categories.id
            WHERE resources.status = 'approved'
            ORDER BY resources.id ASC
        `);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/resources - Create a new resource (requires login)
router.post('/', authenticateToken, validateCategory('resource'), async (req, res) => {
    const { title, description, link, category_id } = req.body;

    if (!title || !link) {
        return res.status(400).json({ message: 'Title and Link are required' });
    }

    try {
        //Admins automatically get approved, users go to pending
        const status = req.user.role === 'admin' ? 'approved' : 'pending';

        const result = await pool.query(
            'INSERT INTO resources (title, description, link, category_id, status, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *, (SELECT name FROM categories WHERE categories.id = resources.category_id) AS category',
            [title, description, link, category_id, status, req.user.id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// PATCH /api/resources/:id - Update an existing resource
router.patch('/:id', authenticateToken, validateCategory('resource'), async (req, res) => {
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
        category_id
    } = req.body;

    if (!title || !link) {
        return res.status(400).json({
            message: 'Title and Link are required'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE resources
             SET title = $1,
                 description = $2,
                 link = $3,
                 category_id = CASE WHEN $6::boolean THEN $4 ELSE category_id END
             WHERE id = $5
             RETURNING *, (SELECT name FROM categories WHERE categories.id = resources.category_id) AS category`,
            [
                title,
                description,
                link,
                category_id,
                id,
                Object.prototype.hasOwnProperty.call(req.body, 'category_id')
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
