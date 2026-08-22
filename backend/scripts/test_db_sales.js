require('dotenv').config();
const pool = require('./shared/db/connection');

async function test() {
    const res = await pool.query('SELECT sale_id, quantity, price_charged, standard_price_snap, vendor_price_snap FROM sale_items ORDER BY sale_id LIMIT 10');
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
}
test();
