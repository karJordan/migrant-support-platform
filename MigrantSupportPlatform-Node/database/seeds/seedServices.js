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
                name: '2-Bedroom Flat in Mount Eden',
                description: '2-bed flat, $550/week, available 1 Oct. Close to transport and shops. Contact Maria on 021 555 0123.',
                category_id: categoryMap.housing,
                location: 'Auckland',
                phone: '021 555 0123',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Single Room in Shared House, Newtown',
                description: 'Furnished single room in shared house, $280/week incl. power and wifi. Available now. Contact James on 021 555 0456.',
                category_id: categoryMap.housing,
                location: 'Wellington',
                phone: '021 555 0456',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: '3-Bedroom House in Riccarton',
                description: '3-bed house with garden, $620/week, available 15 Nov. Ideal for family. Contact Sarah on 021 555 0789.',
                category_id: categoryMap.housing,
                location: 'Christchurch',
                phone: '021 555 0789',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Studio Unit in Hamilton Central',
                description: 'Self-contained studio, $380/week, furnished, available 5 Oct. Walking distance to CBD. Contact Priya on 021 555 0321.',
                category_id: categoryMap.housing,
                location: 'Hamilton',
                phone: '021 555 0321',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Room in Family Home, Dunedin',
                description: 'Room in friendly family home, $250/week incl. meals option. Available 20 Oct. Contact Aroha on 021 555 0678.',
                category_id: categoryMap.housing,
                location: 'Dunedin',
                phone: '021 555 0678',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: '2-Bedroom Unit in Tauranga',
                description: '2-bed unit near beach, $520/week, available 1 Nov. Quiet street, off-street parking. Contact Tom on 021 555 0234.',
                category_id: categoryMap.housing,
                location: 'Tauranga',
                phone: '021 555 0234',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Boarding House Room, Wellington CBD',
                description: 'Single room in boarding house, $320/week incl. utilities. Shared kitchen and bathroom. Contact house manager on 04 555 0111.',
                category_id: categoryMap.housing,
                location: 'Wellington',
                phone: '04 555 0111',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Shared Flat in Ponsonby',
                description: 'Room in 3-bed flat, $340/week + expenses. Flatmates are professionals, quiet household. Contact Liam on 021 555 0888.',
                category_id: categoryMap.housing,
                location: 'Auckland',
                phone: '021 555 0888',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Family Home in Lower Hutt',
                description: '4-bed family home, $680/week, available 1 Dec. Large backyard, close to schools. Contact Rachel on 021 555 0999.',
                category_id: categoryMap.housing,
                location: 'Lower Hutt',
                phone: '021 555 0999',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Studio Apartment in Christchurch CBD',
                description: 'Modern studio, $400/week, furnished, available 10 Oct. Close to hospital and university. Contact Ben on 021 555 0444.',
                category_id: categoryMap.housing,
                location: 'Christchurch',
                phone: '021 555 0444',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Room in Shared House, Palmerston North',
                description: 'Double room in shared house, $220/week incl. bills. Quiet neighbourhood. Contact Hemi on 021 555 0555.',
                category_id: categoryMap.housing,
                location: 'Palmerston North',
                phone: '021 555 0555',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: '2-Bedroom Flat in Napier',
                description: '2-bed flat, $480/week, available 25 Oct. Recently renovated, close to town. Contact Ana on 021 555 0666.',
                category_id: categoryMap.housing,
                location: 'Napier',
                phone: '021 555 0666',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Room in Shared House, Nelson',
                description: 'Sunny room in shared house, $260/week. Garden, bike storage. Available now. Contact Kate on 021 555 0777.',
                category_id: categoryMap.housing,
                location: 'Nelson',
                phone: '021 555 0777',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: '1-Bedroom Unit in Rotorua',
                description: 'Self-contained 1-bed unit, $360/week, available 1 Nov. Quiet area, close to shops. Contact Wiremu on 021 555 0222.',
                category_id: categoryMap.housing,
                location: 'Rotorua',
                phone: '021 555 0222',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Room in Shared House, Invercargill',
                description: 'Furnished room in shared house, $200/week incl. power and internet. Close to hospital. Contact Dave on 021 555 0333.',
                category_id: categoryMap.housing,
                location: 'Invercargill',
                phone: '021 555 0333',
                website: null,
                status: 'approved',
                created_by: null,
            },
            {
                name: '2-Bedroom Unit in Porirua',
                description: '2-bed unit, $500/week, available 20 Oct. Heat pump, off-street parking. Contact Mere on 021 555 0445.',
                category_id: categoryMap.housing,
                location: 'Porirua',
                phone: '021 555 0445',
                website: null,
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