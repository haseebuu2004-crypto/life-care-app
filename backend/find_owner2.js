require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({connectionString: process.env.DATABASE_URL});

async function run() {
    try {
        const ownerId = '3ab51607-4452-4941-8f3a-82de44b18ae9';
        const stockItems = await pool.query(`
            SELECT s.id, p.name as product_name, s.quantity as qty, pv.vendor_price, s.vendor_price_snap, pv.is_active 
            FROM stock s 
            JOIN product_versions pv ON s.product_version_id = pv.id 
            JOIN products p ON pv.product_id = p.id 
            WHERE s.owner_id = $1
        `, [ownerId]);
        console.log('All Stock items:', stockItems.rows);
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
