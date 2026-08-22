require('dotenv').config();
const pool = require('./config/db');

async function checkStockEntries() {
    try {
        const res = await pool.query('SELECT * FROM stock_entries LIMIT 1');
        console.log(res.rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
checkStockEntries();
