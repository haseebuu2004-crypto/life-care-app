require('dotenv').config();
const pool = require('./config/db');

async function check() {
    try {
        const res = await pool.query('SELECT * FROM attendance');
        console.log("Total attendance records:", res.rows.length);
        console.log("First 3 records:", res.rows.slice(0, 3));
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
check();
