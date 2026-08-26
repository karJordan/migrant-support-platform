require('dotenv').config();

const pool = require('../../db');

async function seedServices() {
    try {
        await pool.query(`
            INSERT INTO services
            (name, description, category, location, phone, website)
            SELECT
                'Citizens Advice Bureau',
                'Free information and support on everyday issues.',
                'Community',
                'Auckland',
                '0800 367 222',
                'https://www.cab.org.nz'
            WHERE NOT EXISTS (
                SELECT 1 FROM services
                WHERE name = 'Citizens Advice Bureau'
            );
        `);

        await pool.query(`
            INSERT INTO services
            (name, description, category, location, phone, website)
            SELECT
                'Community Housing Support',
                'Help with housing and tenancy issues.',
                'Housing',
                'Wellington',
                NULL,
                'https://example.org'
            WHERE NOT EXISTS (
                SELECT 1 FROM services
                WHERE name = 'Community Housing Support'
            );
        `);

        console.log('Service seed complete.');
    } catch (error) {
        console.error('Seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedServices();