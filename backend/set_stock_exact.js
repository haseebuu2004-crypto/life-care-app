require('dotenv').config();
const pool = require('./config/db');

async function setStock() {
    try {
        await pool.query(`UPDATE stock SET quantity = 10 WHERE product_version_id = '09aac69c-3be7-4ca0-a2c8-24148a463ad5'`); // Kulfi
        await pool.query(`UPDATE stock SET quantity = 10 WHERE product_version_id = 'ee75949a-1e3b-4604-a969-5c70a531ad1f'`); // Chocolate
        await pool.query(`UPDATE stock SET quantity = 23 WHERE product_version_id = '4ad95177-2e17-4f15-aff5-ead1977a418a'`); // Formula 1
        console.log("Stock forcefully corrected to 10, 10, 23.");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
setStock();
