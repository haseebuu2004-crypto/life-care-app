const db = require('./db');
const owner = '3ab51607-4452-4941-8f3a-82de44b18ae9';
async function run() {
    try {
        const stock = await db.query('SELECT s.id, s.product_version_id, s.quantity, pv.product_id FROM stock s JOIN product_versions pv ON s.product_version_id = pv.id WHERE s.owner_id = $1', [owner]);
        console.log("STOCK:", stock.rows);
        const pv = await db.query('SELECT pv.id, pv.product_id, p.name FROM product_versions pv JOIN products p ON pv.product_id = p.id WHERE p.owner_id = $1', [owner]);
        console.log("VERSIONS:", pv.rows);
        const flavours = await db.query('SELECT id, product_id, name FROM flavours WHERE owner_id = $1', [owner]);
        console.log("FLAVOURS:", flavours.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
