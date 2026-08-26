const express = require('express');
const router = express.Router();
const pool = require('../db');

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
// New services route
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM services ORDER BY id ASC'
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;