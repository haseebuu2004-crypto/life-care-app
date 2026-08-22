const db = require('./db');
async function test() {
  try {
    const ownerId = '3ab51607-4452-4941-8f3a-82de44b18ae9';
    const cRes = await db.query('SELECT id FROM customers LIMIT 1');
    const customerId = cRes.rows[0].id;

    // Get an active stock item for this owner
    const stRes = await db.query('SELECT product_version_id, quantity FROM stock WHERE quantity > 0 AND owner_id = $1 LIMIT 1', [ownerId]);
    const pvId = stRes.rows[0].product_version_id;

    const itemsJson = [{
      product_version_id: pvId,
      flavour_id: '5bd722e8-1d12-4475-b172-23e4c1d20572',
      quantity: 1,
      price_charged: 100,
      standard_price_snap: 100,
      vendor_price_snap: 80
    }];

    const date = new Date().toISOString().split('T')[0];

    const res = await db.query(`
      SELECT create_sale_atomic($1, $2, $3, $4, $5::jsonb) as sale_id
    `, [ownerId, customerId, date, ownerId, JSON.stringify(itemsJson)]);

    const saleId = res.rows[0].sale_id;
    console.log("Created sale_id:", saleId);

    const items = await db.query('SELECT * FROM sale_items WHERE sale_id = $1', [saleId]);
    console.log("Sale items:", items.rows);
    
    // Cleanup
    await db.query('DELETE FROM sales WHERE id = $1', [saleId]);
    await db.query('UPDATE stock SET quantity = quantity + 1 WHERE product_version_id = $1', [pvId]);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
