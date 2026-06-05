require('dotenv').config();
const pool = require('./config/db');

async function fix() {
    try {
        const res = await pool.query('UPDATE attendance SET is_deleted = false, deleted_at = null WHERE is_deleted = true');
        console.log("Restored rows:", res.rowCount);
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
fix();
