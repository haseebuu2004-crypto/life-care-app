require('dotenv').config();
const pool = require('./config/db');

async function analyzeSales() {
    const salesRes = await pool.query(`
        SELECT si.id, si.sale_id, si.product_version_id, si.flavour_id, si.quantity, si.price_charged, sa.customer_id, sa.created_at
        FROM sale_items si
        JOIN sales sa ON si.sale_id = sa.id
        WHERE sa.is_deleted = false
        ORDER BY sa.created_at DESC
    `);
    console.log("Sale Items in DB:", salesRes.rows);
    process.exit(0);
}
analyzeSales();
