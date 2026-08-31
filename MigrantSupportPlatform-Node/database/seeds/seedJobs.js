require('dotenv').config();

const pool = require('../../db');

async function seedJobs() {
    try {
        await pool.query(`
            INSERT INTO jobs
            (title, company, location, employment_type, description, status, created_by)
            SELECT
                'Customer Service Representative',
                'Auckland Community Services',
                'Auckland',
                'Full Time',
                'Support customers by phone and email and help resolve general enquiries.',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM jobs
                WHERE title = 'Customer Service Representative'
                AND company = 'Auckland Community Services'
            );
        `);

        await pool.query(`
            INSERT INTO jobs
            (title, company, location, employment_type, description, status, created_by)
            SELECT
                'Administrative Assistant',
                'Wellington Support Network',
                'Wellington',
                'Part Time',
                'Provide administrative support, maintain records, and assist with scheduling.',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM jobs
                WHERE title = 'Administrative Assistant'
                AND company = 'Wellington Support Network'
            );
        `);

        await pool.query(`
            INSERT INTO jobs
            (title, company, location, employment_type, description, status, created_by)
            SELECT
                'Warehouse Team Member',
                'South Island Logistics',
                'Christchurch',
                'Casual',
                'Assist with receiving, organising, and preparing stock for distribution.',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM jobs
                WHERE title = 'Warehouse Team Member'
                AND company = 'South Island Logistics'
            );
        `);

        console.log('Job seed complete.');
    } catch (error) {
        console.error('Job seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedJobs();