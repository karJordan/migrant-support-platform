const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM community_groups WHERE status = 'approved' ORDER BY id ASC");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/', authenticateToken, async (req, res) => {
    