const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const validateCategory = require('../middleware/validateCategory');

// GROUPS
router.get('/groups', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                community_groups.id,
                community_groups.name,
                community_groups.description,
                community_groups.status,
                community_groups.created_at,
                community_groups.category_id,
                categories.name AS category
            FROM community_groups
            LEFT JOIN categories ON community_groups.category_id = categories.id
            WHERE community_groups.status = 'approved'
            ORDER BY community_groups.id ASC
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/groups', authenticateToken, validateCategory('community', { optional: true }), async (req, res) => {
    const { name, category_id, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    try {
        const status = req.user.role === 'admin' ? 'approved' : 'pending';
        const result = await pool.query(
            'INSERT INTO community_groups (name, category_id, description, status, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *, (SELECT name FROM categories WHERE categories.id = community_groups.category_id) AS category',
            [name, category_id, description, status, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// PATCH /api/community/groups/:id - Update an existing community group
router.patch('/groups/:id', authenticateToken, validateCategory('community', { optional: true }), async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Admin access required'
        });
    }

    const { id } = req.params;
    const { name, category_id, description } = req.body;

    if (!name) {
        return res.status(400).json({
            message: 'Name is required'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE community_groups
             SET name = $1,
                 category_id = CASE WHEN $5::boolean THEN $2 ELSE category_id END,
                 description = $3
             WHERE id = $4
             RETURNING *, (SELECT name FROM categories WHERE categories.id = community_groups.category_id) AS category`,
            [
                name,
                category_id,
                description,
                id,
                Object.prototype.hasOwnProperty.call(req.body, 'category_id')
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Community group not found'
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

// EVENTS
router.get('/events', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                community_events.id,
                community_events.title,
                community_events.description,
                community_events.location,
                community_events.event_date,
                community_events.event_time,
                community_events.status,
                community_events.created_at,
                community_events.category_id,
                categories.name AS category
            FROM community_events
            LEFT JOIN categories ON community_events.category_id = categories.id
            WHERE community_events.status = 'approved'
            ORDER BY community_events.event_date ASC
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/events', authenticateToken, validateCategory('community', { optional: true }), async (req, res) => {
    const { title, category_id, location, event_date, event_time, description } = req.body;

    if (!title || !event_date || !event_time) {
        return res.status(400).json({ message: 'Title, Event Date, and Event Time are required' });
    }

    try {
        const status = req.user.role === 'admin' ? 'approved' : 'pending';
        const result = await pool.query(
            'INSERT INTO community_events (title, category_id, location, event_date, event_time, description, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *, (SELECT name FROM categories WHERE categories.id = community_events.category_id) AS category',
            [title, category_id, location, event_date, event_time, description, status, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// PATCH /api/community/events/:id - Update an existing community event
router.patch('/events/:id', authenticateToken, validateCategory('community', { optional: true }), async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Admin access required'
        });
    }

    const { id } = req.params;
    const {
        title,
        category_id,
        location,
        event_date,
        event_time,
        description
    } = req.body;

    if (!title) {
        return res.status(400).json({
            message: 'Title is required'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE community_events
             SET title = $1,
                 category_id = CASE WHEN $8::boolean THEN $2 ELSE category_id END,
                 location = $3,
                 event_date = $4,
                 event_time = $5,
                 description = $6
             WHERE id = $7
             RETURNING *, (SELECT name FROM categories WHERE categories.id = community_events.category_id) AS category`,
            [
                title,
                category_id,
                location,
                event_date,
                event_time,
                description,
                id,
                Object.prototype.hasOwnProperty.call(req.body, 'category_id')
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Community event not found'
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
