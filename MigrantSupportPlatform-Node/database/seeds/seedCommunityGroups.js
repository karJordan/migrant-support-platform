require('dotenv').config();

const pool = require('../../db');
const getCategoryId = require('./getCategoryId');

async function seedCommunityGroups() {
    try {
        const categoryMap = {
            social: await getCategoryId('Local', 'community'),
            language: await getCategoryId('Support', 'community'),
            family: await getCategoryId('Support', 'community'),
        };

        const rows = [
            {
                name: 'New Migrants Social Group',
                category_id: categoryMap.social,
                description: 'A friendly group for newcomers to meet people, share experiences, and build local connections.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'English Conversation Group',
                category_id: categoryMap.language,
                description: 'Informal weekly meetups for migrants who want to practise conversational English.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Migrant Families Network',
                category_id: categoryMap.family,
                description: 'A community group for migrant families to share local information, activities, and support.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Newcomers Walking Group',
                category_id: categoryMap.social,
                description: 'A relaxed weekly walking group for newcomers to explore local parks and meet others.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'International Women\u2019s Circle',
                category_id: categoryMap.social,
                description: 'A supportive group for migrant women to connect, share experiences, and build friendships.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Migrant Professionals Network',
                category_id: categoryMap.social,
                description: 'Networking and career support for skilled migrants working in professional roles.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Youth Migrant Group',
                category_id: categoryMap.social,
                description: 'A social group for young migrants aged 16\u201325 to meet, share experiences, and have fun.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Beginner English Class',
                category_id: categoryMap.language,
                description: 'A structured beginner-level English class for migrants with little or no English.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Intermediate English Conversation',
                category_id: categoryMap.language,
                description: 'Conversation practice for migrants with intermediate English who want to improve fluency.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'IELTS Preparation Group',
                category_id: categoryMap.language,
                description: 'Study group for migrants preparing for IELTS exams for work, study, or residency.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Mandarin Speakers Meetup',
                category_id: categoryMap.language,
                description: 'A social and language group for Mandarin-speaking migrants in the local community.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Spanish Conversation Group',
                category_id: categoryMap.language,
                description: 'A group for Spanish-speaking migrants to connect and maintain language skills.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Arabic Speakers Community',
                category_id: categoryMap.language,
                description: 'A community group for Arabic-speaking migrants to share culture and support each other.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Migrant Parents Support Group',
                category_id: categoryMap.family,
                description: 'Support and information for migrant parents navigating schools, healthcare, and family life.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Single Parent Migrant Network',
                category_id: categoryMap.family,
                description: 'A supportive network for single migrant parents to share resources and encouragement.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Grandparents and Wh\u0101nau Group',
                category_id: categoryMap.family,
                description: 'A group for migrant grandparents and extended family members to connect and share.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Playgroup for Migrant Families',
                category_id: categoryMap.family,
                description: 'A weekly playgroup where migrant parents and young children can meet and play.',
                status: 'approved',
                created_by: null,
            },
            {
                name: 'Family Cultural Exchange Group',
                category_id: categoryMap.family,
                description: 'Families share food, traditions, and stories from their home cultures with each other.',
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
                    `INSERT INTO community_groups
                        (name, category_id, description, status, created_by)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (name) DO NOTHING`,
                    [
                        row.name,
                        row.category_id,
                        row.description,
                        row.status,
                        row.created_by,
                    ]
                );
                inserted += result.rowCount;
            }

            await client.query('COMMIT');
            console.log(`Community group seed complete. ${inserted} inserted, ${rows.length - inserted} skipped.`);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        process.exitCode = 1;
        console.error('Community group seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedCommunityGroups();