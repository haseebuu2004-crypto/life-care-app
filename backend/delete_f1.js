require('dotenv').config();
const db = require('./db');
async function run() {
    try {
        const res = await db.query(`DELETE FROM products WHERE name = 'Formula 1 Shake'`);
        console.log('Deleted rows:', res.rowCount);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
