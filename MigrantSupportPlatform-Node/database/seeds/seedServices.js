require('dotenv').config();

const pool = require('../../db');
const getCategoryId = require('./getCategoryId');

async function seedServices() {
    try {
        const adviceCategoryId = await getCategoryId('Other', 'service');
        const housingCategoryId = await getCategoryId('Accommodation', 'service');
        const policeCategoryId = await getCategoryId('Other', 'service');
        const licensingCategoryId = await getCategoryId('Transport', 'service');
        await pool.query(`
            INSERT INTO services
            (name, description, category_id, location, phone, website, status)
            SELECT
                'Citizens Advice Bureau',
                'Free information and support on everyday issues.',
                $1,
                'Auckland',
                '0800 367 222',
                'https://www.cab.org.nz',
                'approved'
            WHERE NOT EXISTS (
                SELECT 1 FROM services
                WHERE name = 'Citizens Advice Bureau'
            );
        `, [adviceCategoryId]);

        await pool.query(`
            INSERT INTO services
            (name, description, category_id, location, phone, website, status)
            SELECT
                'Community Housing Support',
                'Help with housing and tenancy issues.',
                $1,
                'Wellington',
                NULL,
                'https://example.org',
                'approved'
            WHERE NOT EXISTS (
                SELECT 1 FROM services
                WHERE name = 'Community Housing Support'
            );
        `, [housingCategoryId]);
        await pool.query(`
    INSERT INTO services
    (name, description, category_id, location, phone, website, status, created_by)
    SELECT
        'New Zealand Police',
        'Information about reporting crime, community safety, and contacting New Zealand Police.',
        $1,
        'Nationwide',
        '105',
        'https://www.police.govt.nz',
        'approved',
        NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM services
        WHERE name = 'New Zealand Police'
    );
`, [policeCategoryId]);
        await pool.query(`
    INSERT INTO services
    (name, description, category_id, location, phone, website, status, created_by)
    SELECT
        'New Zealand Driver Licensing',
        'Information about driver licences, converting overseas licences, tests, and driving requirements in New Zealand.',
        $1,
        'Nationwide',
        NULL,
        'https://www.nzta.govt.nz/driver-licences/',
        'approved',
        NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM services
        WHERE name = 'New Zealand Driver Licensing'
    );
`, [licensingCategoryId]);

        console.log('Service seed complete.');
    } catch (error) {
        process.exitCode = 1;
        console.error('Seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedServices();