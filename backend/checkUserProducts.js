const db = require('./db');
const owner = '0d527797-63be-401c-b465-721103a38d4d';
async function run() {
    try {
        const result = await db.query('SELECT pv.id as pv_id, p.owner_id, p.name, f.name as flavour FROM product_versions pv JOIN products p ON pv.product_id = p.id LEFT JOIN flavours f ON f.product_id = p.id WHERE p.owner_id = $1', [owner]);
        console.log(result.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
