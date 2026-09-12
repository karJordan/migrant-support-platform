const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/categories - list all categories, optionally filtered by type
// e.g. /api/categories?type=job
router.get('/', async (req, res) => {
    const { type } = req.query;

    try {
        const result = type
            ? await pool.query(
                "SELECT * FROM categories WHERE $1 = ANY(applies_to) ORDER BY name",
                [type]
              )
            : await pool.query("SELECT * FROM categories ORDER BY name");

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;