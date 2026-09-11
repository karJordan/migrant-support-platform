const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET
router.get('/', async (req, res) => {
    const { query } = req.query;

    if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    try {
        const searchTerm = `%${query}%`;
        const results = [];
        const lowerQuery = query.toLowerCase();

        // Search in services
        const services = await pool.query(`
            SELECT
                listing.id,
                listing.name as title,
                listing.description,
                listing.category_id,
                c.name AS category,
                listing.location,
                'service' as type,
                '/services/' || listing.id as href
            FROM services AS listing
            LEFT JOIN categories AS c ON listing.category_id = c.id
            WHERE
                listing.name ILIKE $1
                OR listing.description ILIKE $1
                OR c.name ILIKE $1
                OR listing.location ILIKE $1
        `, [searchTerm]);
        results.push(...services.rows);

        // Search in jobs
        const jobs = await pool.query(`
            SELECT
                listing.id,
                listing.title,
                listing.description,
                listing.company,
                listing.category_id,
                c.name AS category,
                listing.location,
                'job' as type,
                '/jobs/' || listing.id as href
            FROM jobs AS listing
            LEFT JOIN categories AS c ON listing.category_id = c.id
            WHERE
                listing.title ILIKE $1
                OR listing.description ILIKE $1
                OR listing.employment_type ILIKE $1
                OR listing.location ILIKE $1
                OR listing.company ILIKE $1
                OR c.name ILIKE $1
        `, [searchTerm]);
        results.push(...jobs.rows);

        // Search in resources
        const resources = await pool.query(`
            SELECT
                listing.id,
                listing.title,
                listing.description,
                listing.category_id,
                c.name AS category,
                NULL as location,
                'resource' as type,
                '/resources/' || listing.id as href
            FROM resources AS listing
            LEFT JOIN categories AS c ON listing.category_id = c.id
            WHERE
                listing.title ILIKE $1
                OR listing.description ILIKE $1
                OR c.name ILIKE $1
        `, [searchTerm]);
        results.push(...resources.rows);

        // Search in community events
        const events = await pool.query(`
            SELECT
                listing.id,
                listing.title,
                listing.description,
                listing.category_id,
                c.name AS category,
                listing.location,
                'community_event' as type,
                '/events/' || listing.id as href
            FROM community_events AS listing
            LEFT JOIN categories AS c ON listing.category_id = c.id
            WHERE
                listing.title ILIKE $1
                OR listing.description ILIKE $1
                OR listing.location ILIKE $1
                OR c.name ILIKE $1
        `, [searchTerm]);
        results.push(...events.rows);

        // Search in community groups
        const groups = await pool.query(`
            SELECT
                listing.id,
                listing.name as title,
                listing.description,
                listing.category_id,
                c.name AS category,
                NULL as location,
                'community_group' as type,
                '/groups/' || listing.id as href
            FROM community_groups AS listing
            LEFT JOIN categories AS c ON listing.category_id = c.id
            WHERE
                listing.name ILIKE $1
                OR listing.description ILIKE $1
                OR c.name ILIKE $1
        `, [searchTerm]);
        results.push(...groups.rows);

        // ============================================
        // 2. SPECIAL CASES (Add extra results)
        // ============================================

        // Job cases
        if (lowerQuery === 'job' || lowerQuery === 'jobs') {
            const allJobs = await pool.query(`
                SELECT
                    listing.id,
                    listing.title,
                    listing.description,
                    listing.company,
                    listing.category_id,
                    c.name AS category,
                    listing.location,
                    'job' as type,
                    '/jobs/' || listing.id as href
                FROM jobs AS listing
                LEFT JOIN categories AS c ON listing.category_id = c.id
                WHERE listing.status = 'approved' OR listing.status IS NULL
                ORDER BY listing.created_at DESC
                LIMIT 20
            `);
            results.push(...allJobs.rows);
        }

        // Service cases
        if (lowerQuery === 'service' || lowerQuery === 'services') {
            const allServices = await pool.query(`
                SELECT
                    listing.id,
                    listing.name as title,
                    listing.description,
                    listing.category_id,
                    c.name AS category,
                    listing.location,
                    'service' as type,
                    '/services/' || listing.id as href
                FROM services AS listing
                LEFT JOIN categories AS c ON listing.category_id = c.id
                WHERE listing.status = 'approved' OR listing.status IS NULL
                ORDER BY listing.created_at DESC
                LIMIT 20
            `);
            results.push(...allServices.rows);
        }

        // Resource cases
        if (lowerQuery === 'resource' || lowerQuery === 'resources') {
            const allResources = await pool.query(`
                SELECT
                    listing.id,
                    listing.title,
                    listing.description,
                    listing.category_id,
                    c.name AS category,
                    NULL as location,
                    'resource' as type,
                    '/resources/' || listing.id as href
                FROM resources AS listing
                LEFT JOIN categories AS c ON listing.category_id = c.id
                WHERE listing.status = 'approved' OR listing.status IS NULL
                ORDER BY listing.created_at DESC
                LIMIT 20
            `);
            results.push(...allResources.rows);
        }

        // Event cases
        if (lowerQuery === 'event' || lowerQuery === 'events') {
            const allEvents = await pool.query(`
                SELECT
                    listing.id,
                    listing.title,
                    listing.description,
                    listing.category_id,
                    c.name AS category,
                    listing.location,
                    'community_event' as type,
                    '/events/' || listing.id as href
                FROM community_events AS listing
                LEFT JOIN categories AS c ON listing.category_id = c.id
                WHERE listing.status = 'approved' OR listing.status IS NULL
                ORDER BY listing.created_at DESC
                LIMIT 20
            `);
            results.push(...allEvents.rows);
        }

        //  Group cases
        if (lowerQuery === 'group' || lowerQuery === 'groups') {
            const allGroups = await pool.query(`
                SELECT
                    listing.id,
                    listing.name as title,
                    listing.description,
                    listing.category_id,
                    c.name AS category,
                    NULL as location,
                    'community_group' as type,
                    '/groups/' || listing.id as href
                FROM community_groups AS listing
                LEFT JOIN categories AS c ON listing.category_id = c.id
                WHERE listing.status = 'approved' OR listing.status IS NULL
                ORDER BY listing.created_at DESC
                LIMIT 20
            `);
            results.push(...allGroups.rows);
        }

        // Community cases (both events and groups)
        if (lowerQuery === 'community') {
            const allEvents = await pool.query(`
                SELECT
                    listing.id,
                    listing.title,
                    listing.description,
                    listing.category_id,
                    c.name AS category,
                    listing.location,
                    'community_event' as type,
                    '/events/' || listing.id as href
                FROM community_events AS listing
                LEFT JOIN categories AS c ON listing.category_id = c.id
                WHERE listing.status = 'approved' OR listing.status IS NULL
                ORDER BY listing.created_at DESC
                LIMIT 20
            `);
            results.push(...allEvents.rows);

            const allGroups = await pool.query(`
                SELECT
                    listing.id,
                    listing.name as title,
                    listing.description,
                    listing.category_id,
                    c.name AS category,
                    NULL as location,
                    'community_group' as type,
                    '/groups/' || listing.id as href
                FROM community_groups AS listing
                LEFT JOIN categories AS c ON listing.category_id = c.id
                WHERE listing.status = 'approved' OR listing.status IS NULL
                ORDER BY listing.created_at DESC
                LIMIT 20
            `);
            results.push(...allGroups.rows);
        }

        // sort by relevance: exact matches first
        const searchLower = query.toLowerCase();
        results.sort((a, b) => {
            const aExact = a.title.toLowerCase() === searchLower ? 1 : 0;
            const bExact = b.title.toLowerCase() === searchLower ? 1 : 0;
            if (aExact !== bExact) return bExact - aExact; // Exact matches first

            const typeOrder = { 'service': 0, 'job': 1, 'resource': 2, 'community_group': 3, 'community_event': 4 };
            return (typeOrder[a.type] || 4) - (typeOrder[b.type] || 4); // Then by type
        });

        res.json(results);

    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
