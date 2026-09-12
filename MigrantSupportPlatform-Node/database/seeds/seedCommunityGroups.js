require('dotenv').config();

const pool = require('../../db');
const getCategoryId = require('./getCategoryId');

async function seedCommunityGroups() {
    try {
        const socialCategoryId = await getCategoryId('Local', 'community');
        const languageCategoryId = await getCategoryId('Support', 'community');
        const familyCategoryId = await getCategoryId('Support', 'community');
        await pool.query(`
            INSERT INTO community_groups
            (name, category_id, description, status, created_by)
            SELECT
                'New Migrants Social Group',
                $1,
                'A friendly group for newcomers to meet people, share experiences, and build local connections.',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM community_groups
                WHERE name = 'New Migrants Social Group'
            );
        `, [socialCategoryId]);

        await pool.query(`
            INSERT INTO community_groups
            (name, category_id, description, status, created_by)
            SELECT
                'English Conversation Group',
                $1,
                'Informal weekly meetups for migrants who want to practise conversational English.',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM community_groups
                WHERE name = 'English Conversation Group'
            );
        `, [languageCategoryId]);

        await pool.query(`
            INSERT INTO community_groups
            (name, category_id, description, status, created_by)
            SELECT
                'Migrant Families Network',
                $1,
                'A community group for migrant families to share local information, activities, and support.',
                'approved',
                NULL
            WHERE NOT EXISTS (
                SELECT 1 FROM community_groups
                WHERE name = 'Migrant Families Network'
            );
        `, [familyCategoryId]);

        console.log('Community group seed complete.');
    } catch (error) {
        process.exitCode = 1;
        console.error('Community group seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedCommunityGroups();