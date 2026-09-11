require('dotenv').config();

const pool = require('../../db');

async function seedCategories() {
    try {
        const categories = [
            { name: 'Healthcare', applies_to: ['job', 'service', 'resource'] },
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
            await pool.query(`
                INSERT INTO categories (name, applies_to)
                VALUES ($1, $2)
                ON CONFLICT (name) DO UPDATE
                SET applies_to = ARRAY(
                    SELECT DISTINCT unnest(categories.applies_to || EXCLUDED.applies_to)
                )
            `, [category.name, category.applies_to]);
            console.log(`Seeded category: ${category.name}`);
        }

        console.log('Categories seeded successfully.');
    } catch (err) {
        process.exitCode = 1;
        console.error('Error seeding categories:', err);
    } finally {
        await pool.end();
    }
}

seedCategories();