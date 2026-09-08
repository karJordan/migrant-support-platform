const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    const { user_id, listing_type, listing_id } = req.body;

    if (!user_id || !listing_id || !listing_type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const existing = await pool.query(
            'SELECT * FROM saved_listings WHERE user_id = $1 AND listing_type = $2 AND listing_id = $3',
            [user_id, listing_type, listing_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Listing already saved' });
        }

        await pool.query(
            'INSERT INTO saved_listings (user_id, listing_type, listing_id) VALUES ($1, $2, $3)',
            [user_id, listing_type, listing_id]
        );

        res.status(201).json({ message: 'Listing saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save listing' });
    }
});

router.delete('/', async (req, res) => {
    const { user_id, listing_type, listing_id } = req.body;

    try {
        await pool.query(
            'DELETE FROM saved_listings WHERE user_id = $1 AND listing_type = $2 AND listing_id = $3 RETURNING *',
            [user_id, listing_type, listing_id]
        );

        res.json({ message: 'Listing removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove Listing' });
    }
});

router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const saved = await pool.query(
            'SELECT listing_type, listing_id FROM saved_listings WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        );
        res.json(saved.rows);
    } catch (error) {
        console.error('Error fetching saved listings:', error);
        res.status(500).json({ error: 'Failed to fetch saved listings' });
    }
});

router.get('/check/:user_id/:listing_type/:listing_id', async (req, res) => {
    const { user_id, listing_type, listing_id } = req.params;

    try {
        const result = await pool.query(
            'SELECT id FROM saved_listings WHERE user_id = $1 AND listing_type = $2 AND listing_id = $3',
            [user_id, listing_type, listing_id]
        );
        res.json({ saved: result.rows.length > 0 });
    } catch (error) {
        console.error('Error checking saved status:', error);
        res.status(500).json({ error: 'Failed to check saved status' });
    }
});

module.exports = router;