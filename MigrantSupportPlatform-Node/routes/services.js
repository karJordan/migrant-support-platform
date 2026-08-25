const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

module.exports = router;