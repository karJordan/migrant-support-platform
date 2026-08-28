const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// GROUPS
router.get('/groups', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM community_groups WHERE status = 'approved' ORDER BY id ASC");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/groups', authenticateToken, async (req, res) => {
    const { name, category, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    try {
        const status = req.user.role === 'admin' ? 'approved' : 'pending';
        const result = await pool.query(
            'INSERT INTO community_groups (name, category, description, status, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, category, description, status, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// EVENTS
router.get('/events', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM community_events WHERE status = 'approved' ORDER BY event_date ASC");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/events', authenticateToken, async (req, res) => {
    const { title, location, event_date, event_time, description } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const status = req.user.role === 'admin' ? 'approved' : 'pending';
        const result = await pool.query(
            'INSERT INTO community_events (title, location, event_date, event_time, description, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, location, event_date, event_time, description, status, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;