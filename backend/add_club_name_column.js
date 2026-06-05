require('dotenv').config();
const db = require('./db');
async function run() {
    try {
        await db.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS club_name VARCHAR(100)`);
        console.log("Successfully added club_name column to admin_config");
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}
run();
