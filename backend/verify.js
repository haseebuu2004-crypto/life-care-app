require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({connectionString: process.env.DATABASE_URL});

async function run() {
    try {
        const ownerId = (await pool.query('SELECT owner_id FROM stock LIMIT 1')).rows[0].owner_id;
        console.log('Owner:', ownerId);
        
        const pvRes = await pool.query('SELECT * FROM product_versions');
        console.log('Product Versions:', pvRes.rows);
        
        const adminConfig = await pool.query('SELECT low_stock_threshold FROM admin_config WHERE owner_id = $1', [ownerId]);
        console.log('Low stock threshold:', adminConfig.rows[0].low_stock_threshold);
        
        const lowStockItems = await pool.query(`
            SELECT s.id, p.name as product_name, s.quantity as qty, pv.vendor_price, s.vendor_price_snap
            FROM stock s
            JOIN product_versions pv ON s.product_version_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE s.owner_id = $1 AND pv.is_active = true
            ORDER BY s.quantity ASC
        `, [ownerId]);
        console.log('Stock query (raw items):', lowStockItems.rows);

        const salesStats = await pool.query(`
            SELECT 
                (SELECT COALESCE(SUM((si.price_charged - si.vendor_price_snap) * si.quantity), 0) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.owner_id = $1 AND s.is_deleted = false) as "totalSalesProfit",
                (SELECT COALESCE(SUM(si.price_charged * si.quantity), 0) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.owner_id = $1 AND s.is_deleted = false) as "totalSalesRevenue",
                (SELECT COALESCE(SUM(s.quantity * s.vendor_price_snap), 0) FROM stock s JOIN product_versions pv ON s.product_version_id = pv.id WHERE s.owner_id = $1 AND pv.is_active = true) as "totalStockVpValue"
        `, [ownerId]);
        console.log('Sales Stats:', salesStats.rows[0]);
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
