const db = require('./db');
const owner = '0d527797-63be-401c-b465-721103a38d4d';
async function run() {
    try {
        await db.query(`
            INSERT INTO stock (owner_id, product_version_id, quantity, vendor_price_snap) 
            SELECT $1, id, 50, vendor_price FROM product_versions WHERE id = $2
        `, [owner, 'aca5276e-6674-4016-9497-46b19807b3de']);
        console.log('Stock restored for test account');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
