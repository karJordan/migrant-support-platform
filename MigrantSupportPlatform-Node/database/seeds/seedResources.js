require('dotenv').config();

const pool = require('../../db');
const getCategoryId = require('./getCategoryId');

async function seedResources() {
    try {
        const categoryMap = {
            immigration: await getCategoryId('Visa & Immigration', 'resource'),
            employment: await getCategoryId('Employment', 'resource'),
            healthcare: await getCategoryId('Healthcare', 'resource'),
            housing: await getCategoryId('Accommodation', 'resource'),
            banking: await getCategoryId('Banking', 'resource'),
        };

        const rows = [
            {
                title: 'Immigration New Zealand',
                description: 'Official information about visas, immigration requirements, and settling in New Zealand.',
                link: 'https://www.immigration.govt.nz',
                category_id: categoryMap.immigration,
                status: 'approved',
                created_by: null,
            },
            {
                title: 'Careers New Zealand',
                description: 'Career planning, job search guidance, and information about working in New Zealand.',
                link: 'https://www.careers.govt.nz',
                category_id: categoryMap.employment,
                status: 'approved',
                created_by: null,
            },
            {
                title: 'Health New Zealand',
                description: 'Information about healthcare services and accessing health support in New Zealand.',
                link: 'https://www.tewhatuora.govt.nz',
                category_id: categoryMap.healthcare,
                status: 'approved',
                created_by: null,
            },
            {
                title: 'Work and Income - Find a House',
                description: 'Government support for finding public or private housing, including eligibility for social housing.',
                link: 'https://www.workandincome.govt.nz/housing/find-a-house/index.html',
                category_id: categoryMap.housing,
                status: 'approved',
                created_by: null,
            },
            {
                title: 'Trade Me Property',
                description: "New Zealand's largest property marketplace — rentals, flatmates, and homes for sale.",
                link: 'https://www.trademe.co.nz/property',
                category_id: categoryMap.housing,
                status: 'approved',
                created_by: null,
            },
            {
                title: 'realestate.co.nz',
                description: 'Property search across New Zealand with smart filters for rentals, apartments, and new builds.',
                link: 'https://www.realestate.co.nz',
                category_id: categoryMap.housing,
                status: 'approved',
                created_by: null,
            },
            {
                title: 'Work and Income — Find Jobs',
                description: 'Search job vacancies, get job matches, and apply online through MyMSD.',
                link: 'https://www.workandincome.govt.nz/work/find-jobs',
                category_id: categoryMap.employment,
                status: 'approved',
                created_by: null,
            },
            {
                title: 'SEEK New Zealand',
                description: 'Major job search site with thousands of listings across New Zealand.',
                link: 'https://www.seek.co.nz',
                category_id: categoryMap.employment,
                status: 'approved',
                created_by: null,
            },
            {
                title: 'Enrolling with a GP',
                description: 'Why and how to enrol with a general practice in New Zealand.',
                link: 'https://www.healthnz.govt.nz/hospitals-services/services-support/asian-migrant-and-refugee-health/signing-up-with-a-healthcare-provider',
                category_id: categoryMap.healthcare,
                status: 'approved',
                created_by: null,
            },
            {
                title: 'Healthline',
                description: 'Free 24/7 health advice from registered nurses. Call 0800 611 116.',
                link: 'https://www.healthline.govt.nz',
                category_id: categoryMap.healthcare,
                status: 'approved',
                created_by: null,
            },
            {
                title: 'Sorted - Budgeting Tool',
                description: 'Free online budgeting tool to help you plan and manage your money.',
                link: 'https://sorted.org.nz',
                category_id: categoryMap.banking, 
                status: 'approved',
                created_by: null,
            },
            {
                title: 'MoneyTalks',
                description: 'Free financial helpline - call 0800 345 123 or text 4029 for budgeting and debt support.',
                link: 'https://www.moneytalks.co.nz',
                category_id: categoryMap.banking,
                status: 'approved',
                created_by: null,
            },
        ];

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let inserted = 0;
            for (const row of rows) {
                const result = await client.query(
                    `INSERT INTO resources
                        (title, description, link, category_id, status, created_by)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     ON CONFLICT (title) DO NOTHING`,
                    [
                        row.title,
                        row.description,
                        row.link,
                        row.category_id,
                        row.status,
                        row.created_by,
                    ]
                );
                inserted += result.rowCount;
            }

            await client.query('COMMIT');
            console.log(`Resource seed complete. ${inserted} inserted, ${rows.length - inserted} skipped.`);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        process.exitCode = 1;
        console.error('Resource seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedResources();