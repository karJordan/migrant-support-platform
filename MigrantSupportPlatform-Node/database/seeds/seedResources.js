require('dotenv').config();

const pool = require('../../db');

async function seedResources() {
    try {
        await pool.query(`
            INSERT INTO resources
            (title, description, link, category, status, created_by)
            SELECT
                'Immigration New Zealand',
                'Official information about visas, immigration requirements, and settling in New Zealand.',
                'https://www.immigration.govt.nz',
                'Immigration',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM resources
                WHERE title = 'Immigration New Zealand'
            );
        `);

        await pool.query(`
            INSERT INTO resources
            (title, description, link, category, status, created_by)
            SELECT
                'Careers New Zealand',
                'Career planning, job search guidance, and information about working in New Zealand.',
                'https://www.careers.govt.nz',
                'Employment',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM resources
                WHERE title = 'Careers New Zealand'
            );
        `);

        await pool.query(`
            INSERT INTO resources
            (title, description, link, category, status, created_by)
            SELECT
                'Health New Zealand',
                'Information about healthcare services and accessing health support in New Zealand.',
                'https://www.tewhatuora.govt.nz',
                'Healthcare',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM resources
                WHERE title = 'Health New Zealand'
            );
        `);

        console.log('Resource seed complete.');
    } catch (error) {
        console.error('Resource seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedResources();