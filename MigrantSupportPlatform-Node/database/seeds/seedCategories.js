require('dotenv').config();

const pool = require('../../db');

async function seedCategories() {
    try {
        const categories = [
            { name: 'Healthcare', applies_to: ['job', 'service'] },
            { name: 'Transport', applies_to: ['service'] },
            { name: 'Legal', applies_to: ['service', 'resource'] },
            { name: 'Translation', applies_to: ['service'] },
            { name: 'Banking', applies_to: ['service', 'resource', 'job'] },
            { name: 'IT', applies_to: ['job'] },
            { name: 'Retail', applies_to: ['job'] },
            { name: 'Customer Service', applies_to: ['job'] },
            { name: 'Hospitality', applies_to: ['job'] },
            { name: 'Education', applies_to: ['job', 'service', 'resource'] },
            { name: 'Cultural', applies_to: ['community'] },
            { name: 'Support', applies_to: ['community'] },
            { name: 'Local', applies_to: ['community'] },
            { name: 'Visa & Immigration', applies_to: ['resource', 'service']  },
            { name: 'Accommodation', applies_to: ['resource', 'service'] },
            { name: 'Employment', applies_to: ['resource', 'service'] },
            { name: 'Volunteering', applies_to: ['resource', 'service'] },
            { name: 'Other', applies_to: ['job', 'service', 'community', 'resource'] }
        ];

        for (const category of categories) {
            const existing = await pool.query(
                'SELECT id FROM categories WHERE name = $1',
                [category.name]
            );

            if (existing.rows.length === 0) {
                await pool.query(`
                    INSERT INTO categories (name, applies_to)
                    VALUES ($1, $2)
                `, [category.name, category.applies_to]);
                console.log(`✅ Created category: ${category.name}`);
            } else {
                console.log(`⏭️ Category already exists: ${category.name}`);
            }
        }

        console.log('Categories seeded successfully.');
    } catch (err) {
        console.error('Error seeding categories:', err);
    } finally {
        await pool.end();
    }
}

seedCategories();