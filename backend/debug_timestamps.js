require('dotenv').config();
const pool = require('./config/db');

async function debug3() {
    try {
        let res = await pool.query('SELECT is_deleted, deleted_at FROM attendance WHERE is_deleted = true LIMIT 5');
        console.log("Deleted attendance:", res.rows);
        
        res = await pool.query('SELECT is_deleted, deleted_at FROM sales WHERE is_deleted = true LIMIT 5');
        console.log("Deleted sales:", res.rows);
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
debug3();
