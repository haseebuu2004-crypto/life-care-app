require('dotenv').config();
const db = require('./shared/db/connection');

async function run() {
    try {
        const check = await db.query(`SELECT id FROM settings WHERE key = 'SYSTEM_LOW_STOCK_THRESHOLD'`);
        if (check.rows.length === 0) {
            await db.query(`INSERT INTO settings (key, value) VALUES ('SYSTEM_LOW_STOCK_THRESHOLD', '10')`);
            console.log("Setting inserted");
        } else {
            console.log("Setting already exists");
        }
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
