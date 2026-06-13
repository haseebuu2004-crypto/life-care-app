require('dotenv').config();
const db = require('./shared/db/connection');

async function f() {
    try {
        const res = await db.query(`
            SELECT 
                v.id AS variant_id,
                p.id AS product_id,
                pv.id AS product_version_id,
                p.name AS product_name,
                v.name AS variant_name,
                v.sku,
                pv.vendor_price,
                pv.volume_points,
                v.is_active,
                v.low_stock_threshold,
                v.alert_enabled
            FROM variants v
            JOIN product_versions pv ON pv.id = v.product_version_id
            JOIN products p ON p.id = pv.product_id
            WHERE p.owner_id = (SELECT id FROM users LIMIT 1)
              AND pv.is_active = true
        `);
        console.log("Entities returned to frontend:");
        console.log(res.rows.map(r => ({ variant_id: r.variant_id, product_name: r.product_name, variant_name: r.variant_name })));
    } catch(e) { console.error(e); }
    process.exit();
}
f();
