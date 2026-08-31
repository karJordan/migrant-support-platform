require('dotenv').config();

const pool = require('../../db');

async function seedCommunityEvents() {
    try {
        await pool.query(`
            INSERT INTO community_events
            (title, location, event_date, event_time, description, status, created_by)
            SELECT
                'Newcomers Welcome Evening',
                'Auckland Central Library',
                '2026-09-15',
                '18:00',
                'Meet other newcomers, learn about local services, and connect with community organisations.',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM community_events
                WHERE title = 'Newcomers Welcome Evening'
                AND event_date = '2026-09-15'
            );
        `);

        await pool.query(`
            INSERT INTO community_events
            (title, location, event_date, event_time, description, status, created_by)
            SELECT
                'Community Employment Workshop',
                'Wellington Community Centre',
                '2026-09-22',
                '17:30',
                'A practical workshop covering CV preparation, job searching, and employment support for migrants.',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM community_events
                WHERE title = 'Community Employment Workshop'
                AND event_date = '2026-09-22'
            );
        `);

        await pool.query(`
            INSERT INTO community_events
            (title, location, event_date, event_time, description, status, created_by)
            SELECT
                'International Food and Culture Day',
                'Christchurch Community Hall',
                '2026-10-03',
                '12:00',
                'A community event celebrating food, music, and cultures from around the world.',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM community_events
                WHERE title = 'International Food and Culture Day'
                AND event_date = '2026-10-03'
            );
        `);

        console.log('Community event seed complete.');
    } catch (error) {
        console.error('Community event seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedCommunityEvents();