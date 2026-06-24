require('dotenv').config();
const db = require('./db');

async function main() {
    try {
        const id = '59ce3b1c-3618-4579-ba4a-afde93eec30e';
        const email = 'deleted_1781759195127_hasieeyy444@gmail.com';
        const origEmail = 'hasieeyy444@gmail.com';

        const sales = await db.query("SELECT count(*) FROM sales WHERE recorded_by IN ($1, $2)", [email, origEmail]);
        const attendance = await db.query("SELECT count(*) FROM attendance WHERE recorded_by IN ($1, $2)", [email, origEmail]);
        const stockEntries = await db.query("SELECT count(*) FROM stock_entries WHERE added_by IN ($1, $2)", [email, origEmail]);
        
        console.log(`Found ${sales.rows[0].count} sales`);
        console.log(`Found ${attendance.rows[0].count} attendance records`);
        console.log(`Found ${stockEntries.rows[0].count} stock entries`);
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

main();
