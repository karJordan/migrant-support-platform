require('dotenv').config();

const pool = require('../../db');
const bcrypt = require('bcryptjs');

async function seedUsers() {
    try {
        const testPassword = await bcrypt.hash('password123', 10);
        const adminPassword = await bcrypt.hash('adminpassword123', 10);
        const playwrightPassword = await bcrypt.hash('playwrightpassword123', 10);

        const users = [
            {name: 'Test User', email: 'test@test.com', password: testPassword, role: 'user'},
            {name: 'Admin User', email: 'admin@test.com', password: adminPassword, role: 'admin'},
            {name: 'E2E Test User', email: 'playwright@test.com', password: playwrightPassword, role: 'user'},
        ];

        for (const user of users) {
        
            const existing = await pool.query(
                'SELECT id FROM users WHERE email = $1',
                [user.email]
            );
            
            if (existing.rows.length === 0) {
                await pool.query(`
                    INSERT INTO users (name, email, password, role)
                    VALUES ($1, $2, $3, $4)
                `, [user.name, user.email, user.password, user.role]);
                console.log(`✅ Created user: ${user.email}`);
            } else {
                console.log(`⏭️ User already exists: ${user.email}`);
            }
        }

        console.log('Users seeded successfully.');
    } catch (err) {
        console.error('Error seeding users:', err);
    } finally {
       await pool.end();
    }
}

seedUsers();