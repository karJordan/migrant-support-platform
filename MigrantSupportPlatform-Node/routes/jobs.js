const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const validateCategory = require('../middleware/validateCategory');

// GET /api/jobs - Get approved jobs
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                jobs.id,
                jobs.title,
                jobs.company,
                jobs.location,
                jobs.employment_type,
                jobs.description,
                jobs.status,
                jobs.created_at,
                jobs.category_id,
                categories.name AS category
            FROM jobs
            LEFT JOIN categories ON jobs.category_id = categories.id
            WHERE jobs.status = 'approved'
            ORDER BY jobs.id ASC
        `);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/jobs - Create a new job (requires login)
router.post('/', authenticateToken, validateCategory('job'), async (req, res) => {
    const { title, company, location, employment_type, category_id, description } = req.body;

    if (!title || !company) {
        return res.status(400).json({ message: 'Title and Company are required' });
    }

    try {
        //Admins get automatically approved, users go to pending
        const status = req.user.role === 'admin' ? 'approved' : 'pending';

        const result = await pool.query(
            'INSERT INTO jobs (title, company, location, employment_type, category_id, description, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *, (SELECT name FROM categories WHERE categories.id = jobs.category_id) AS category',
            [title, company, location, employment_type, category_id, description, status, req.user.id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// PATCH /api/jobs/:id - Update an existing job
router.patch('/:id', authenticateToken, validateCategory('job'), async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Admin access required'
        });
    }

    const { id } = req.params;
    const {
        title,
        company,
        location,
        employment_type,
        category_id,
        description
    } = req.body;

    if (!title || !company) {
        return res.status(400).json({
            message: 'Title and Company are required'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE jobs
             SET title = $1,
                 company = $2,
                 location = $3,
                 employment_type = $4,
                 category_id = CASE WHEN $8::boolean THEN $5 ELSE category_id END,
                 description = $6
             WHERE id = $7
             RETURNING *, (SELECT name FROM categories WHERE categories.id = jobs.category_id) AS category`,
            [
                title,
                company,
                location,
                employment_type,
                category_id,
                description,
                id,
                Object.prototype.hasOwnProperty.call(req.body, 'category_id')
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Job not found'
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
