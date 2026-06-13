require('dotenv').config();
const pool = require('./shared/db/connection');

async function test() {
    const res = await pool.query(`
        SELECT 
            s.id as sale_id,
            s.sale_date,
            si.id as item_id,
            si.quantity,
            si.price_charged,
            si.vendor_price_snap
        FROM sales s
        LEFT JOIN sale_items si ON si.sale_id = s.id
        WHERE s.sale_date = '2026-06-12' OR s.sale_date = '2026-06-11'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
}
test();
