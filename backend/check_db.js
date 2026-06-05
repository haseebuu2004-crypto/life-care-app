require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkDb() {
  const res = await pool.query(`SELECT id, customer_id, attendance_date, is_deleted FROM attendance ORDER BY created_at DESC LIMIT 5`);
  console.log("Attendance records:");
  console.log(res.rows);
  const custRes = await pool.query(`SELECT id, name FROM customers WHERE name ILIKE '%habeeb%'`);
  console.log("Customers:");
  console.log(custRes.rows);
  process.exit(0);
}
checkDb();
