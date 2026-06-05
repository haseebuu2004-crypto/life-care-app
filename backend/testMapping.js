const db = require('./db');
const salesService = require('./services/salesService');

async function test() {
  try {
    const ownerId = '3ab51607-4452-4941-8f3a-82de44b18ae9';
    // Make sure there is active stock
    const pvRes = await db.query('SELECT id FROM product_versions WHERE owner_id = $1 LIMIT 1', [ownerId]);
    if (pvRes.rows.length > 0) {
       await db.query('UPDATE product_versions SET is_active = true WHERE id = $1', [pvRes.rows[0].id]);
       await db.query('UPDATE stock SET quantity = 10 WHERE product_version_id = $1', [pvRes.rows[0].id]);
    }
    
    // Now fetch stock exactly as stockController does
    const result = await db.query(`
        SELECT 
            s.id as stock_id,
            pv.id as version_id,
            p.id as product_id,
            p.name as product_name,
            f.id as flavour_id,
            f.name as flavor,
            pv.vendor_price,
            pv.volume_points,
            COALESCE(s.quantity, 0) as qty
        FROM product_versions pv
        JOIN products p ON pv.product_id = p.id
        LEFT JOIN flavours f ON f.product_id = p.id AND f.is_active = true
        INNER JOIN stock s ON s.product_version_id = pv.id AND s.owner_id = $1
        WHERE p.owner_id = $1 AND pv.is_active = true
        ORDER BY p.name ASC
    `, [ownerId]);
    
    const data = result.rows.map(row => ({
        id: `${row.version_id}_${row.flavour_id || 'none'}`, 
        version_id: row.version_id,
        flavour_id: row.flavour_id,
        stock_id: row.stock_id,
        product_id: row.product_id,
        product_name: row.product_name,
        flavor: row.flavor,
        vendor_price: row.vendor_price / 100, 
        vp: row.volume_points, 
        qty: row.qty
    }));
    
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
