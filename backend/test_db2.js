const { Pool } = require('pg');
require('dotenv').config({ path: '../backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const scalarQuery = `
      SELECT 
          (SELECT COALESCE(SUM((si.price_charged - si.vendor_price_snap) * si.quantity), 0) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.owner_id = $1 AND s.sale_date >= $3 AND s.sale_date <= $4 AND s.is_deleted = false) as "totalSalesProfit",
          (SELECT COALESCE(SUM(si.price_charged * si.quantity), 0) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.owner_id = $1 AND s.sale_date >= $3 AND s.sale_date <= $4 AND s.is_deleted = false) as "totalSalesRevenue",
          (SELECT COALESCE(SUM(s.quantity * s.vendor_price_snap), 0) FROM stock s WHERE s.owner_id = $1) as "totalStockVpValue",
          (SELECT COALESCE(SUM(shake_amount), 0) FROM attendance WHERE owner_id = $1 AND attendance_date >= $3 AND attendance_date <= $4 AND is_deleted = false) as "totalShakeProfit",
          (SELECT COUNT(*) FROM stock s WHERE s.owner_id = $1 AND s.quantity <= $2) as "lowStock"
    `;
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    
    // get an ownerId
    const res = await pool.query(`SELECT id FROM users LIMIT 1`);
    if (res.rows.length === 0) { console.log('no users'); return; }
    const ownerId = res.rows[0].id;
    console.log("Owner ID:", ownerId);

    const testQ = await pool.query(scalarQuery, [ownerId, 10, startDate, endDate]);
    console.log("Scalar Query Result:", testQ.rows[0]);

  } catch(e) {
    console.error("Error:", e);
  } finally {
    pool.end();
  }
}
run();
