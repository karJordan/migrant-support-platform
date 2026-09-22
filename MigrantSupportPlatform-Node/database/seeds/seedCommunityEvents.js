require('dotenv').config();

const pool = require('../../db');
const getCategoryId = require('./getCategoryId');

async function seedCommunityEvents() {
    try {
        const categoryMap = {
            welcome: await getCategoryId('Local', 'community'),
            workshop: await getCategoryId('Support', 'community'),
            culture: await getCategoryId('Cultural', 'community'),
        };

        const rows = [
            {
                title: 'Newcomers Welcome Evening',
                location: 'Auckland Central Library',
                event_date: '2026-09-15',
                event_time: '18:00',
                description: 'Meet other newcomers, learn about local services, and connect with community organisations.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.welcome,
            },
            {
                title: 'Community Employment Workshop',
                location: 'Wellington Community Centre',
                event_date: '2026-09-22',
                event_time: '17:30',
                description: 'A practical workshop covering CV preparation, job searching, and employment support for migrants.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.workshop,
            },
            {
                title: 'International Food and Culture Day',
                location: 'Christchurch Community Hall',
                event_date: '2026-10-03',
                event_time: '12:00',
                description: 'A community event celebrating food, music, and cultures from around the world.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.culture,
            },
            {
                title: 'English Conversation Group',
                location: 'Hamilton Central Library',
                event_date: '2026-09-18',
                event_time: '10:00',
                description: 'A relaxed weekly group for practising English conversation with local volunteers.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.workshop,
            },
            {
                title: 'Migrant Settlement Information Session',
                location: 'Auckland Migrant Centre',
                event_date: '2026-09-25',
                event_time: '14:00',
                description: 'Information about visas, healthcare, education, and settling into life in New Zealand.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.welcome,
            },
            {
                title: 'CV and Interview Skills Workshop',
                location: 'Wellington Central Library',
                event_date: '2026-10-08',
                event_time: '17:30',
                description: 'Hands-on workshop to improve your CV and prepare for interviews in the New Zealand job market.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.workshop,
            },
            {
                title: 'Diwali Community Celebration',
                location: 'Auckland Community Hall',
                event_date: '2026-10-20',
                event_time: '18:00',
                description: 'A community celebration of Diwali with food, music, and cultural performances.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.culture,
            },
            {
                title: 'Chinese New Year Community Gathering',
                location: 'Christchurch Community Centre',
                event_date: '2027-02-06',
                event_time: '11:00',
                description: 'A family-friendly gathering to celebrate Chinese New Year with the local community.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.culture,
            },
            {
                title: 'Matariki Community Morning',
                location: 'Wellington Botanic Garden',
                event_date: '2027-06-25',
                event_time: '09:00',
                description: 'A morning of Matariki celebrations including storytelling, kai, and community activities.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.culture,
            },
            {
                title: 'New Migrant Orientation Day',
                location: 'Dunedin Community Centre',
                event_date: '2026-11-05',
                event_time: '09:30',
                description: 'An orientation day for new migrants covering local services, transport, and community groups.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.welcome,
            },
            {
                title: 'Job Search Strategies for Migrants',
                location: 'Auckland Central Library',
                event_date: '2026-11-12',
                event_time: '17:00',
                description: 'Learn effective job search strategies tailored to the New Zealand market.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.workshop,
            },
            {
                title: 'Volunteering Information Evening',
                location: 'Wellington Community Centre',
                event_date: '2026-11-19',
                event_time: '18:00',
                description: 'Learn about volunteering opportunities in the community and how to get involved.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.welcome,
            },
            {
                title: 'Pacific Island Cultural Festival',
                location: 'South Auckland Community Hub',
                event_date: '2027-03-13',
                event_time: '10:00',
                description: 'A celebration of Pacific Island cultures with performances, food stalls, and craft displays.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.culture,
            },
            {
                title: 'Refugee Support Information Session',
                location: 'Wellington Refugee Centre',
                event_date: '2026-10-15',
                event_time: '13:00',
                description: 'Information session about support services available for refugees and their families.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.welcome,
            },
            {
                title: 'Parenting in a New Country Workshop',
                location: 'Hamilton Family Centre',
                event_date: '2026-10-29',
                event_time: '10:30',
                description: 'A supportive workshop for migrant parents navigating parenting and schooling in New Zealand.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.workshop,
            },
        ];

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let inserted = 0;
            for (const row of rows) {
                const result = await client.query(
                    `INSERT INTO community_events
                        (title, location, event_date, event_time, description, status, created_by, category_id)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     ON CONFLICT (title, event_date) DO NOTHING`,
                    [
                        row.title,
                        row.location,
                        row.event_date,
                        row.event_time,
                        row.description,
                        row.status,
                        row.created_by,
                        row.category_id,
                    ]
                );
                inserted += result.rowCount;
            }

            await client.query('COMMIT');
            console.log(`Community event seed complete. ${inserted} inserted, ${rows.length - inserted} skipped.`);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        process.exitCode = 1;
        console.error('Community event seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedCommunityEvents();