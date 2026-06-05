require('dotenv').config();
const pool = require('./config/db');

async function fixStock() {
    try {
        const res = await pool.query('UPDATE stock SET quantity = 0 WHERE quantity < 0');
        console.log(`Clamped ${res.rowCount} negative stock items to 0.`);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
fixStock();
