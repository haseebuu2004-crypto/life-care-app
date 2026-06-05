require('dotenv').config();
const pool = require('./config/db');

async function debug2() {
    try {
        let res = await pool.query('SELECT count(*) FROM sales');
        console.log("Raw sales count:", res.rows[0].count);
        
        res = await pool.query('SELECT count(*) FROM sales WHERE is_deleted = false');
        console.log("Active sales count:", res.rows[0].count);
        
        res = await pool.query('SELECT is_deleted, deleted_at FROM sales LIMIT 3');
        console.log("Sample sales is_deleted:", res.rows);
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
debug2();
