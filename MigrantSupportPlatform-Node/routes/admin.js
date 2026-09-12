const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

const allowedStatuses = ['all', 'pending', 'approved', 'rejected'];

function getRequestedStatus(req, res) {
    const status = req.query.status || 'pending';

    if (!allowedStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return null;
    }

    return status;
}

// GET /api/admin/users
router.get('/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const result = await pool.query(
            `SELECT id, name, email, role, created_at
             FROM users 
             ORDER BY id ASC`
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// PATCH /api/admin/users/:id - Update a user
router.patch('/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const userId = Number(req.params.id);
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const role = req.body.role;

    if (!Number.isInteger(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!name || !email || !role) {
        return res.status(400).json({
            error: 'Name, email and role are required'
        });
    }

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    // Prevent the signed-in admin from removing their own admin access.
    if (userId === req.user.id && role !== 'admin') {
        return res.status(400).json({
            error: 'You cannot remove your own admin role'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE users
             SET name = $1,
                 email = $2,
                 role = $3
             WHERE id = $4
             RETURNING id, name, email, role, created_at`,
            [name, email, role, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'That email address is already being used'
            });
        }

        console.error('Database update error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/admin/services?status=pending
router.get('/services', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const status = getRequestedStatus(req, res);
    if (!status) return;

    try {
        const result = await pool.query(
            `SELECT
                listing.*,
                categories.name AS category
             FROM services AS listing
             LEFT JOIN categories
                ON listing.category_id = categories.id
             WHERE ($1 = 'all' OR listing.status = $1)
             ORDER BY listing.id ASC`,
            [status]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/admin/resources?status=pending
router.get('/resources', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const status = getRequestedStatus(req, res);
    if (!status) return;

    try {
        const result = await pool.query(
            `SELECT
                listing.*,
                categories.name AS category
             FROM resources AS listing
             LEFT JOIN categories
                ON listing.category_id = categories.id
             WHERE ($1 = 'all' OR listing.status = $1)
             ORDER BY listing.id ASC`,
            [status]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/admin/jobs?status=pending
router.get('/jobs', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const status = getRequestedStatus(req, res);
    if (!status) return;

    try {
        const result = await pool.query(
            `SELECT
                listing.*,
                categories.name AS category
             FROM jobs AS listing
             LEFT JOIN categories
                ON listing.category_id = categories.id
             WHERE ($1 = 'all' OR listing.status = $1)
             ORDER BY listing.id ASC`,
            [status]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/admin/groups?status=pending
router.get('/groups', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const status = getRequestedStatus(req, res);
    if (!status) return;

    try {
        const result = await pool.query(
            `SELECT
                listing.*,
                categories.name AS category
             FROM community_groups AS listing
             LEFT JOIN categories
                ON listing.category_id = categories.id
             WHERE ($1 = 'all' OR listing.status = $1)
             ORDER BY listing.id ASC`,
            [status]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/admin/events?status=pending
router.get('/events', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const status = getRequestedStatus(req, res);
    if (!status) return;

    try {
        const result = await pool.query(
            `SELECT
                listing.*,
                categories.name AS category
             FROM community_events AS listing
             LEFT JOIN categories
                ON listing.category_id = categories.id
             WHERE ($1 = 'all' OR listing.status = $1)
             ORDER BY listing.event_date ASC`,
            [status]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PATCH /api/admin/approve/:type/:id
router.patch('/approve/:type/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const { type, id } = req.params;

    const tables = {
        service: 'services',
        resource: 'resources',
        job: 'jobs',
        group: 'community_groups',
        event: 'community_events'
    };

    const table = tables[type];

    if (!table) {
        return res.status(400).json({ error: 'Invalid type' });
    }

    try {
        const result = await pool.query(
            `UPDATE ${table}
             SET status = 'approved'
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json({
            message: 'Item approved successfully'
        });
    } catch (error) {
        console.error('Database update error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PATCH /api/admin/reject/:type/:id
router.patch('/reject/:type/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const { type, id } = req.params;

    const tables = {
        service: 'services',
        resource: 'resources',
        job: 'jobs',
        group: 'community_groups',
        event: 'community_events'
    };

    const table = tables[type];

    if (!table) {
        return res.status(400).json({ error: 'Invalid type' });
    }

    try {
        const result = await pool.query(
            `UPDATE ${table}
             SET status = 'rejected'
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json({
            message: 'Item rejected successfully'
        });
    } catch (error) {
        console.error('Database update error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;