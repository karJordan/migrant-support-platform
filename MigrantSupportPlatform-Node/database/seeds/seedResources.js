require('dotenv').config();

const pool = require('../../db');
const getCategoryId = require('./getCategoryId');

async function seedResources() {
    try {
        const immigrationCategoryId = await getCategoryId('Visa & Immigration', 'resource');
        const employmentCategoryId = await getCategoryId('Employment', 'resource');
        const healthcareCategoryId = await getCategoryId('Healthcare', 'resource');
        await pool.query(`
            INSERT INTO resources
            (title, description, link, category_id, status, created_by)
            SELECT
                'Immigration New Zealand',
                'Official information about visas, immigration requirements, and settling in New Zealand.',
                'https://www.immigration.govt.nz',
                $1,
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM resources
                WHERE title = 'Immigration New Zealand'
            );
        `, [immigrationCategoryId]);

        await pool.query(`
            INSERT INTO resources
            (title, description, link, category_id, status, created_by)
            SELECT
                'Careers New Zealand',
                'Career planning, job search guidance, and information about working in New Zealand.',
                'https://www.careers.govt.nz',
                $1,
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM resources
                WHERE title = 'Careers New Zealand'
            );
        `, [employmentCategoryId]);

        await pool.query(`
            INSERT INTO resources
            (title, description, link, category_id, status, created_by)
            SELECT
                'Health New Zealand',
                'Information about healthcare services and accessing health support in New Zealand.',
                'https://www.tewhatuora.govt.nz',
                $1,
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM resources
                WHERE title = 'Health New Zealand'
            );
        `, [healthcareCategoryId]);

        console.log('Resource seed complete.');
    } catch (error) {
        process.exitCode = 1;
        console.error('Resource seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedResources();