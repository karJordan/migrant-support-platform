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

// GET /api/community/groups/joined
// Get all groups joined by the logged-in user
router.get('/groups/joined', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                group_memberships.id AS membership_id,
                group_memberships.created_at AS joined_at,
                community_groups.id AS group_id,
                community_groups.name,
                community_groups.description,
                community_groups.category_id,
                categories.name AS category
             FROM group_memberships
             JOIN community_groups
               ON community_groups.id = group_memberships.group_id
             LEFT JOIN categories
               ON categories.id = community_groups.category_id
             WHERE group_memberships.user_id = $1
             ORDER BY group_memberships.created_at DESC`,
            [req.user.id]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error loading joined groups:', error.message);

        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// POST /api/community/groups/:id/join
// Join an approved community group
router.post('/groups/:id/join', authenticateToken, async (req, res) => {
    const groupId = Number(req.params.id);

    if (!Number.isInteger(groupId) || groupId <= 0) {
        return res.status(400).json({
            message: 'Invalid group ID'
        });
    }

    try {
        const groupResult = await pool.query(
            `SELECT id
             FROM community_groups
             WHERE id = $1
               AND status = 'approved'`,
            [groupId]
        );

        if (groupResult.rows.length === 0) {
            return res.status(404).json({
                message: 'Approved community group not found'
            });
        }

        const membershipResult = await pool.query(
            `INSERT INTO group_memberships
                (user_id, group_id)
             VALUES ($1, $2)
             RETURNING
                id,
                user_id,
                group_id,
                created_at`,
            [req.user.id, groupId]
        );

        res.status(201).json({
            message: 'Group joined successfully',
            membership: membershipResult.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                message: 'You have already joined this group'
            });
        }

        console.error('Error joining community group:', error.message);

        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// DELETE /api/community/groups/:id/join
// Leave a community group
router.delete('/groups/:id/join', authenticateToken, async (req, res) => {
    const groupId = Number(req.params.id);

    if (!Number.isInteger(groupId) || groupId <= 0) {
        return res.status(400).json({
            message: 'Invalid group ID'
        });
    }

    try {
        const result = await pool.query(
            `DELETE FROM group_memberships
             WHERE user_id = $1
               AND group_id = $2
             RETURNING id`,
            [req.user.id, groupId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Group membership not found'
            });
        }

        res.status(200).json({
            message: 'Group left successfully'
        });
    } catch (error) {
        console.error('Error leaving community group:', error.message);

        res.status(500).json({
            error: 'Internal Server Error'
        });
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
