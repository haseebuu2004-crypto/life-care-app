const fs = require('fs');
const path = require('path');

async function runMigrations(pool) {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        const { rows } = await pool.query(`SELECT name FROM migrations`);
        const executedMigrations = rows.map(r => r.name);
        const migrationsDir = __dirname;
        
        const files = fs.readdirSync(migrationsDir);
        
        // Get all .js files except index.js, sort them alphabetically
        const migrationFiles = files
            .filter(f => f.endsWith('.js') && f !== 'index.js')
            .sort();

        const pendingMigrations = migrationFiles.filter(f => !executedMigrations.includes(f));

        if (pendingMigrations.length === 0) {
            return;
        }

        console.log(`Found ${pendingMigrations.length} pending migrations.`);

        for (const filename of pendingMigrations) {
            const migration = require(path.join(migrationsDir, filename));
            console.log(`Running migration: ${filename}`);
            
            try {
                await migration.up(pool);
                await pool.query(`INSERT INTO migrations (name) VALUES ($1)`, [filename]);
                console.log(`✅ Migration completed: ${filename}`);
            } catch (err) {
                console.error(`❌ Migration failed: ${filename}`, err);
                throw err;
            }
        }
    } catch (err) {
        console.error("Migration Error:", err);
        throw err;
    }
}

module.exports = runMigrations;
