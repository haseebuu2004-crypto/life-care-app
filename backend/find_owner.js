require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({connectionString: process.env.DATABASE_URL});

async function run() {
    try {
        const stats = await pool.query(`
            SELECT 
                s.owner_id,
                COALESCE(SUM(si.price_charged * si.quantity), 0) as rev,
                COALESCE(SUM((si.price_charged - si.vendor_price_snap) * si.quantity), 0) as prof
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            WHERE s.is_deleted = false
            GROUP BY s.owner_id
        `);
        console.log('Owners:', stats.rows);

        // find the owner with rev = 4298000
        const owner = stats.rows.find(r => r.rev === '4298000' || r.rev == 4298000 || r.rev === '42980.00');
        if (!owner) {
            console.log("Owner not found based on revenue. Checking all owners.");
            return;
        }
        
        console.log("Found Owner:", owner.owner_id);
        const ownerId = owner.owner_id;

        const dashStats = await pool.query(`
            SELECT 
                (SELECT COALESCE(SUM((si.price_charged - si.vendor_price_snap) * si.quantity), 0) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.owner_id = $1 AND s.is_deleted = false) as "totalSalesProfit",
                (SELECT COALESCE(SUM(si.price_charged * si.quantity), 0) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.owner_id = $1 AND s.is_deleted = false) as "totalSalesRevenue",
                (SELECT COALESCE(SUM(s.quantity * s.vendor_price_snap), 0) FROM stock s JOIN product_versions pv ON s.product_version_id = pv.id WHERE s.owner_id = $1 AND pv.is_active = true) as "totalStockVpValue",
                (SELECT COALESCE(SUM(shake_amount), 0) FROM attendance WHERE owner_id = $1 AND is_deleted = false) as "totalShakeProfit"
        `, [ownerId]);
        console.log('Dash Stats:', dashStats.rows[0]);

        const stockItems = await pool.query(`
            SELECT s.id, p.name as product_name, s.quantity as qty, pv.vendor_price, s.vendor_price_snap
            FROM stock s
            JOIN product_versions pv ON s.product_version_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE s.owner_id = $1 AND pv.is_active = true
        `, [ownerId]);
        console.log('Stock items:', stockItems.rows);

        const saleItems = await pool.query(`
            SELECT si.price_charged, si.vendor_price_snap, si.quantity, s.sale_date, p.name
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            JOIN product_versions pv ON si.product_version_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE s.owner_id = $1 AND s.is_deleted = false
        `, [ownerId]);
        console.log('Sale items:', saleItems.rows);

    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
