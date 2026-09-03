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
                id,
                name as title,
                description, 
                category,
                location,
                'service' as type,
                '/services/' || id as href
            FROM services
            WHERE 
                name ILIKE $1
                OR description ILIKE $1 
                OR category ILIKE $1 
                OR location ILIKE $1
        `, [searchTerm]);
        results.push(...services.rows);

        // Search in jobs
        const jobs = await pool.query(`
            SELECT
                id,
                title,
                description,
                company,
                employment_type as category,
                location,
                'job' as type,
                '/jobs/' || id as href
            FROM jobs
            WHERE 
                title ILIKE $1
                OR description ILIKE $1 
                OR employment_type ILIKE $1
                OR location ILIKE $1
                OR company ILIKE $1
        `, [searchTerm]);
        results.push(...jobs.rows);

        // Search in resources
        const resources = await pool.query(`
            SELECT
                id,
                title,
                description,
                category,
                NULL as location,
                'resource' as type,
                '/resources/' || id as href
            FROM resources
            WHERE 
                title ILIKE $1
                OR description ILIKE $1 
                OR category ILIKE $1 
        `, [searchTerm]);
        results.push(...resources.rows);

        // Search in community events 
        const events = await pool.query(`
            SELECT
                id,
                title,
                description,
                'Event' as category,
                location,
                'community_event' as type,
                '/events/' || id as href
            FROM community_events
            WHERE 
                title ILIKE $1
                OR description ILIKE $1  
                OR location ILIKE $1
        `, [searchTerm]);
        results.push(...events.rows);

        // Search in community groups
        const groups = await pool.query(`
            SELECT
                id,
                name as title,
                description,
                'Group' as category,
                NULL as location,
                'community_group' as type,
                '/groups/' || id as href
            FROM community_groups
            WHERE 
                name ILIKE $1
                OR description ILIKE $1  
                OR category ILIKE $1
        `, [searchTerm]);
        results.push(...groups.rows);

        // ============================================
        // 2. SPECIAL CASES (Add extra results)
        // ============================================

        // Job cases
        if (lowerQuery === 'job' || lowerQuery === 'jobs') {
            const allJobs = await pool.query(`
                SELECT
                    id,
                    title,
                    description,
                    company,
                    employment_type as category,
                    location,
                    'job' as type,
                    '/jobs/' || id as href
                FROM jobs
                WHERE status = 'approved' OR status IS NULL
                ORDER BY created_at DESC
                LIMIT 20
            `);
            results.push(...allJobs.rows);
        }

        // Service cases
        if (lowerQuery === 'service' || lowerQuery === 'services') {
            const allServices = await pool.query(`
                SELECT
                    id,
                    name as title,
                    description,
                    category,
                    location,
                    'service' as type,
                    '/services/' || id as href
                FROM services
                WHERE status = 'approved' OR status IS NULL
                ORDER BY created_at DESC
                LIMIT 20
            `);
            results.push(...allServices.rows);
        }

        // Resource cases
        if (lowerQuery === 'resource' || lowerQuery === 'resources') {
            const allResources = await pool.query(`
                SELECT
                    id,
                    title,
                    description,
                    category,
                    NULL as location,
                    'resource' as type,
                    '/resources/' || id as href
                FROM resources
                WHERE status = 'approved' OR status IS NULL
                ORDER BY created_at DESC
                LIMIT 20
            `);
            results.push(...allResources.rows);
        }

        // Event cases
        if (lowerQuery === 'event' || lowerQuery === 'events') {
            const allEvents = await pool.query(`
                SELECT
                    id,
                    title,
                    description,
                    'Event' as category,
                    location,
                    'community_event' as type,
                    '/events/' || id as href
                FROM community_events
                WHERE status = 'approved' OR status IS NULL
                ORDER BY created_at DESC
                LIMIT 20
            `);
            results.push(...allEvents.rows);
        }

        //  Group cases
        if (lowerQuery === 'group' || lowerQuery === 'groups') {
            const allGroups = await pool.query(`
                SELECT
                    id,
                    name as title,
                    description,
                    'Group' as category,
                    NULL as location,
                    'community_group' as type,
                    '/groups/' || id as href
                FROM community_groups
                WHERE status = 'approved' OR status IS NULL
                ORDER BY created_at DESC
                LIMIT 20
            `);
            results.push(...allGroups.rows);
        }

        // Community cases (both events and groups)
        if (lowerQuery === 'community') {
            const allEvents = await pool.query(`
                SELECT
                    id,
                    title,
                    description,
                    'Event' as category,
                    location,
                    'community_event' as type,
                    '/events/' || id as href
                FROM community_events
                WHERE status = 'approved' OR status IS NULL
                ORDER BY created_at DESC
                LIMIT 20
            `);
            results.push(...allEvents.rows);
            
            const allGroups = await pool.query(`
                SELECT
                    id,
                    name as title,
                    description,
                    'Group' as category,
                    NULL as location,
                    'community_group' as type,
                    '/groups/' || id as href
                FROM community_groups
                WHERE status = 'approved' OR status IS NULL
                ORDER BY created_at DESC
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