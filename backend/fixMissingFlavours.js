const db = require('./db');
async function run() {
  try {
    const saleItems = await db.query(`
      SELECT si.id as sale_item_id, pv.product_id, p.name as product_name
      FROM sale_items si
      JOIN product_versions pv ON si.product_version_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE si.flavour_id IS NULL
    `);

    let updatedCount = 0;
    for (const item of saleItems.rows) {
      // Find an active flavour for this product
      const fRes = await db.query(`
        SELECT id FROM flavours WHERE product_id = $1 AND is_active = true ORDER BY created_at ASC LIMIT 1
      `, [item.product_id]);
      
      if (fRes.rows.length > 0) {
        const flavourId = fRes.rows[0].id;
        await db.query(`UPDATE sale_items SET flavour_id = $1 WHERE id = $2`, [flavourId, item.sale_item_id]);
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} sale items with a default flavour.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
