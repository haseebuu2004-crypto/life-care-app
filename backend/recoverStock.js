const db = require('./db');
const owner = '3ab51607-4452-4941-8f3a-82de44b18ae9';
async function run() {
    try {
        await db.query(`
            INSERT INTO stock (owner_id, product_version_id, quantity, vendor_price_snap) 
            SELECT $1, id, $2, vendor_price FROM product_versions WHERE id = $3
        `, [owner, 1, '42d0a3e0-346c-4c81-9381-65652a066228']);
        await db.query(`
            INSERT INTO stock (owner_id, product_version_id, quantity, vendor_price_snap) 
            SELECT $1, id, $2, vendor_price FROM product_versions WHERE id = $3
        `, [owner, -1, 'efd230f5-2fc4-4eb0-873b-384c8f9a5710']);
        await db.query(`
            INSERT INTO stock (owner_id, product_version_id, quantity, vendor_price_snap) 
            SELECT $1, id, $2, vendor_price FROM product_versions WHERE id = $3
        `, [owner, 4, '7341216b-a481-4793-bcfe-23324cb002b9']);
        console.log('Stock restored');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
