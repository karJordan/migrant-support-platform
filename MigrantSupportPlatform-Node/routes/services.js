const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// GET /api/services - Fetch approved services
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                services.id,
                services.name,
                services.description,
                services.location,
                services.phone,
                services.website,
                services.status,
                services.created_at,
                services.category_id,
                categories.name AS category
            FROM services
            LEFT JOIN categories ON services.category_id = categories.id
            WHERE services.status = 'approved'
            ORDER BY services.id ASC
        `);

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
        category_id,
        description,
        location,
        phone,
        website
    } = req.body;

    if (!name || !category_id) {
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
            (name, category_id, description, location, phone, website, status, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                name,
                category_id,
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
// PATCH /api/services/:id - Update an existing service
router.patch('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Admin access required'
        });
    }

    const { id } = req.params;

    const {
        name,
        category_id,
        description,
        location,
        phone,
        website
    } = req.body;

    if (!name || !category_id) {
        return res.status(400).json({
            message: 'Name and category are required'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE services
             SET name = $1,
                 category_id = $2,
                 description = $3,
                 location = $4,
                 phone = $5,
                 website = $6
             WHERE id = $7
             RETURNING *`,
            [
                name,
                category_id,
                description,
                location,
                phone,
                website,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Service not found'
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