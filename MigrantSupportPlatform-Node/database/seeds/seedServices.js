require('dotenv').config();

const pool = require('../../db');
const getCategoryId = require('./getCategoryId');

async function seedServices() {
    try {
        const categoryMap = {
            advice: await getCategoryId('Other', 'service'),
            housing: await getCategoryId('Accommodation', 'service'),
            police: await getCategoryId('Other', 'service'),
            licensing: await getCategoryId('Transport', 'service'),
            legal: await getCategoryId('Legal', 'service'),
            education: await getCategoryId('Education', 'service'),
            transport: await getCategoryId('Transport', 'service'), 
        };

        const rows = [
            {
                name: 'Citizens Advice Bureau',
                description: 'Free information and support on everyday issues.',
                category_id: categoryMap.advice,
                location: 'Auckland',
                phone: '0800 367 222',
                website: 'https://www.cab.org.nz',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Community Housing Support',
                description: 'Help with housing and tenancy issues.',
                category_id: categoryMap.housing,
                location: 'Wellington',
                phone: null,
                website: 'https://example.org',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'New Zealand Police',
                description: 'Information about reporting crime, community safety, and contacting New Zealand Police.',
                category_id: categoryMap.police,
                location: 'Nationwide',
                phone: '105',
                website: 'https://www.police.govt.nz',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'New Zealand Driver Licensing',
                description: 'Information about driver licences, converting overseas licences, tests, and driving requirements in New Zealand.',
                category_id: categoryMap.licensing,
                location: 'Nationwide',
                phone: null,
                website: 'https://www.nzta.govt.nz/driver-licences/',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'English Language Partners New Zealand',
                description: 'English language learning support and resources.',
                category_id: categoryMap.advice,
                location: 'Nationwide',
                phone: null,
                website: 'https://www.englishlanguage.org.nz',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'NZQA - New Zealand Qualifications Authority',
                description: 'Information about qualifications, recognition of overseas qualifications, and assessment services.',
                category_id: categoryMap.advice,
                location: 'Nationwide',
                phone: null,
                website: 'https://www2.nzqa.govt.nz',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Community Law',
                description: 'Free legal advice and information on your rights and responsibilities.',
                category_id: categoryMap.legal,
                location: 'Nationwide',
                phone: null,
                website: 'https://www.communitylaw.org.nz',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Tenancy Services',
                description: 'Information and support for tenants and landlords, including tenancy rights and dispute resolution.',
                category_id: categoryMap.housing,
                location: 'Nationwide',
                phone: null,
                website: 'https://www.tenancy.govt.nz',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Kāinga Ora',
                description: 'Government agency providing housing support and services for Māori and Pasifika communities.',
                category_id: categoryMap.housing,
                location: 'Nationwide',
                phone: null,
                website: 'https://kaingaora.govt.nz',
                status: 'approved', 
                created_by: null,
            },
            {
                name: 'Find your local public transport',
                description: 'Information about public transport options and services in your area.',
                category_id: categoryMap.transport,
                location: 'Nationwide',
                phone: null,
                website: 'https://www.nzta.govt.nz/travelling-on-our-roads/public-transport/public-transport-services-and-infrastructure',
                status: 'approved',
                created_by: null,
            }
        ];

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let inserted = 0;
            for (const row of rows) {
                const result = await client.query(
                    `INSERT INTO services
                        (name, description, category_id, location, phone, website, status, created_by)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     ON CONFLICT (name) DO NOTHING`,
                    [
                        row.name,
                        row.description,
                        row.category_id,
                        row.location,
                        row.phone,
                        row.website,
                        row.status,
                        row.created_by,
                    ]
                );
                inserted += result.rowCount;
            }

            await client.query('COMMIT');
            console.log(`Service seed complete. ${inserted} inserted, ${rows.length - inserted} skipped.`);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        process.exitCode = 1;
        console.error('Service seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedServices();