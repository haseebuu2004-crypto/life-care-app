require('dotenv').config();
const { Client } = require('pg');

const sql = `
ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT false;
ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS google_drive_refresh_token TEXT;
ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS google_drive_email VARCHAR(255);
`;

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    
    try {
        await client.connect();
        console.log("Connected to database. Running alters...");
        await client.query(sql);
        console.log("Alters executed successfully!");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}

run();
