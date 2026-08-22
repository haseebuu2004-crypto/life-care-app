require('dotenv').config();
const pool = require('./config/db');

async function checkStock() {
    try {
        const res = await pool.query('SELECT id, product_version_id, quantity FROM stock WHERE quantity < 0');
        console.log("Negative stock:", res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
checkStock();
