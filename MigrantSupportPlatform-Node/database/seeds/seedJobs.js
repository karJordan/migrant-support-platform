require('dotenv').config();

const pool = require('../../db');
const getCategoryId = require('./getCategoryId');

async function seedJobs() {
    try {
        const customerServiceCategoryId = await getCategoryId('Customer Service', 'job');
        const administrationCategoryId = await getCategoryId('Other', 'job');
        const warehouseCategoryId = await getCategoryId('Other', 'job');
        await pool.query(`
            INSERT INTO jobs
            (title, company, location, employment_type, description, status, created_by, category_id)
            SELECT
                'Customer Service Representative',
                'Auckland Community Services',
                'Auckland',
                'Full Time',
                'Support customers by phone and email and help resolve general enquiries.',
                'approved',
                NULL,
                $1
            WHERE NOT EXISTS (
                SELECT 1 FROM jobs
                WHERE title = 'Customer Service Representative'
                AND company = 'Auckland Community Services'
            );
        `, [customerServiceCategoryId]);

        await pool.query(`
            INSERT INTO jobs
            (title, company, location, employment_type, description, status, created_by, category_id)
            SELECT
                'Administrative Assistant',
                'Wellington Support Network',
                'Wellington',
                'Part Time',
                'Provide administrative support, maintain records, and assist with scheduling.',
                'approved',
                NULL,
                $1
            WHERE NOT EXISTS (
                SELECT 1 FROM jobs
                WHERE title = 'Administrative Assistant'
                AND company = 'Wellington Support Network'
            );
        `, [administrationCategoryId]);

        await pool.query(`
            INSERT INTO jobs
            (title, company, location, employment_type, description, status, created_by, category_id)
            SELECT
                'Warehouse Team Member',
                'South Island Logistics',
                'Christchurch',
                'Casual',
                'Assist with receiving, organising, and preparing stock for distribution.',
                'approved',
                NULL,
                $1
            WHERE NOT EXISTS (
                SELECT 1 FROM jobs
                WHERE title = 'Warehouse Team Member'
                AND company = 'South Island Logistics'
            );
        `, [warehouseCategoryId]);

        console.log('Job seed complete.');
    } catch (error) {
        process.exitCode = 1;
        console.error('Job seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedJobs();