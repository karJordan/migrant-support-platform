require('dotenv').config();

const pool = require('../../db');

async function seedCommunityGroups() {
    try {
        await pool.query(`
            INSERT INTO community_groups
            (name, category, description, status, created_by)
            SELECT
                'New Migrants Social Group',
                'Social',
                'A friendly group for newcomers to meet people, share experiences, and build local connections.',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM community_groups
                WHERE name = 'New Migrants Social Group'
            );
        `);

        await pool.query(`
            INSERT INTO community_groups
            (name, category, description, status, created_by)
            SELECT
                'English Conversation Group',
                'Language',
                'Informal weekly meetups for migrants who want to practise conversational English.',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM community_groups
                WHERE name = 'English Conversation Group'
            );
        `);

        await pool.query(`
            INSERT INTO community_groups
            (name, category, description, status, created_by)
            SELECT
                'Migrant Families Network',
                'Family',
                'A community group for migrant families to share local information, activities, and support.',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM community_groups
                WHERE name = 'Migrant Families Network'
            );
        `);

        console.log('Community group seed complete.');
    } catch (error) {
        console.error('Community group seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedCommunityGroups();