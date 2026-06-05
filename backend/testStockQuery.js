const db = require('./db');
async function test() {
  try {
    const ownerId = '3ab51607-4452-4941-8f3a-82de44b18ae9';
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
    console.log(result.rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
