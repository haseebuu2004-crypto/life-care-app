const db = require('./db');
async function test() {
  try {
    const r = await db.query(`
      SELECT si.id as sale_item_id, pv.product_id, p.name as product_name
      FROM sale_items si
      JOIN product_versions pv ON si.product_version_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE si.flavour_id IS NULL
    `);
    console.log(r.rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
