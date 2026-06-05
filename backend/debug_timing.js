require('dotenv').config();
const pool = require('./config/db');

async function debug4() {
    try {
        const res1 = await pool.query('SELECT created_at, is_deleted FROM attendance WHERE is_deleted = false');
        console.log("Active attendance:", res1.rows);
        
        const res2 = await pool.query('SELECT created_at, is_deleted FROM attendance WHERE is_deleted = true LIMIT 3');
        console.log("Deleted attendance:", res2.rows);
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
debug4();
