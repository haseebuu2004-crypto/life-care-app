require('dotenv').config();
const pool = require('./shared/db/connection');

async function test() {
    const res = await pool.query(`
        SELECT v.id as variant_id, v.name as variant_name, p.name as product_name, s.quantity
        FROM stock s
        JOIN variants v ON s.variant_id = v.id
        JOIN product_versions pv ON v.product_version_id = pv.id
        JOIN products p ON pv.product_id = p.id
        ORDER BY p.name, v.name
    `);
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
}
test();
