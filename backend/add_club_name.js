require('dotenv').config();
const pool = require('./config/db');

async function migrate() {
    try {
        await pool.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS club_name VARCHAR(100);`);
        console.log("Successfully added club_name to admin_config");
        
        const res = await pool.query(`
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'admin_config' AND column_name = 'club_name';
        `);
        console.log("Migration check:", res.rows);
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        process.exit(0);
    }
}

migrate();
