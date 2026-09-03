const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

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

// GET /api/admin/services - Get pending services
router.get('/services', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM services WHERE status = 'pending' ORDER BY id ASC"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/admin/resources - Get pending resources
router.get('/resources', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM resources WHERE status = 'pending' ORDER BY id ASC"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/admin/jobs - Get pending jobs
router.get('/jobs', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM jobs WHERE status = 'pending' ORDER BY id ASC"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/admin/groups - Get pending groups
router.get('/groups', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM community_groups WHERE status = 'pending' ORDER BY id ASC"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/admin/events - Get pending events
router.get('/events', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM community_events WHERE status = 'pending' ORDER BY event_date ASC"
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;