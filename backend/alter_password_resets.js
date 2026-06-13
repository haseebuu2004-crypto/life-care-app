require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    try {
        console.log("Altering password_resets table...");
        await pool.query(`ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS token_hash VARCHAR(255) UNIQUE;`);
        console.log("Successfully added token_hash column.");
    } catch (e) {
        console.error("Failed to alter table:", e);
    } finally {
        await pool.end();
    }
}

run();
