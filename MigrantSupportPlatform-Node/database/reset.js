const path = require('node:path');
const { createInterface } = require('node:readline/promises');
const { spawnSync } = require('node:child_process');

const backendDir = path.resolve(__dirname, '..');
const seedFiles = [
    'seedCategories.js', 'seedUsers.js', 'seedServices.js', 'seedJobs.js',
    'seedCommunityGroups.js', 'seedCommunityEvents.js', 'seedResources.js'
];

async function resetDatabase({ pool, migrate, confirm, seed = false, runSeed }) {
    const client = await pool.connect();
    try {
        const { rows: [target] } = await client.query(
            'SELECT current_database() AS name, inet_server_addr() AS host, inet_server_port() AS port'
        );
        console.log(`Database: ${target.name} (${target.host || 'local socket'}:${target.port || 'local'})`);
        console.log('This deletes all application users, listings, categories and saved bookmarks, and resets IDs.');
        if (!await confirm(target.name)) {
            throw new Error('Reset cancelled. No data changed.');
        }
        await migrate({
            dbClient: client,
            dir: path.join(__dirname, 'migrations'),
            direction: 'up',
            migrationsTable: 'pgmigrations',
            count: Infinity
        });
        // Explicit tables, without CASCADE: unrelated referencing tables cause a safe failure.
        await client.query(`TRUNCATE TABLE public.saved_listings, public.services,
            public.jobs, public.resources, public.community_groups,
            public.community_events, public.categories, public.users RESTART IDENTITY`);
        console.log('Application data cleared. Tables and migration history retained.');
    } finally {
        client.release();
    }
    if (seed) {
        for (const file of seedFiles) {
            await runSeed(file);
        }
        console.log('Dummy data loaded. Saved bookmarks start empty.');
    }
}

async function main() {
    if (process.argv.slice(2).some(arg => arg !== '--seed')) {
        throw new Error('Usage: node database/reset.js [--seed]');
    }
    require('dotenv').config({ path: path.join(backendDir, '.env') });
    const pool = require('../db');
    try {
        const { runner } = await import('node-pg-migrate');
        await resetDatabase({
            pool,
            migrate: runner,
            seed: process.argv.includes('--seed'),
            confirm: async name => {
                if (!process.stdin.isTTY) {
                    throw new Error('Run this command in an interactive terminal to confirm the target database.');
                }
                const terminal = createInterface({ input: process.stdin, output: process.stdout });
                try {
                    return await terminal.question(`Type RESET ${name} to continue: `) === `RESET ${name}`;
                } finally {
                    terminal.close();
                }
            },
            runSeed: file => {
                const result = spawnSync(process.execPath, [path.join(__dirname, 'seeds', file)], {
                    cwd: backendDir, env: process.env, stdio: 'inherit'
                });
                if (result.error || result.status !== 0) {
                    throw new Error(`Reset completed, but ${file} failed. Fix the error and run npm run seed:all.`);
                }
            }
        });
    } finally {
        await pool.end();
    }
}

module.exports = { resetDatabase };
if (require.main === module) {
    main().catch(error => {
        console.error(error.message);
        process.exitCode = 1;
    });
}
