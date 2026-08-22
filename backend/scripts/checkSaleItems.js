const db = require('./db');
async function test() {
  try {
    const r = await db.query('SELECT count(*) as total, count(flavour_id) as with_flavour FROM sale_items');
    console.log(r.rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
