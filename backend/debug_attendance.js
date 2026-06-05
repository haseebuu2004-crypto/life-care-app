require('dotenv').config();
const pool = require('./config/db');

async function debug() {
    try {
        const ownerId = 'cc73146b-c8c9-48c3-a1d4-5e2d736b3c0d'; // Assuming this is the owner based on earlier check
        
        // 1. Raw attendance count
        let res = await pool.query('SELECT count(*) FROM attendance');
        console.log("Raw attendance count:", res.rows[0].count);
        
        // 2. Active attendance count
        res = await pool.query('SELECT count(*) FROM attendance WHERE is_deleted = false');
        console.log("Active attendance count:", res.rows[0].count);
        
        // 3. With customer join
        res = await pool.query('SELECT count(*) FROM attendance a JOIN customers c ON a.customer_id = c.id WHERE a.is_deleted = false');
        console.log("Active attendance joined with customers:", res.rows[0].count);
        
        // 4. With user join
        res = await pool.query('SELECT count(*) FROM attendance a JOIN users u ON a.recorded_by = u.id WHERE a.is_deleted = false');
        console.log("Active attendance joined with users:", res.rows[0].count);
        
        // 5. Why are they deleted?
        res = await pool.query('SELECT is_deleted, deleted_at FROM attendance LIMIT 3');
        console.log("Sample is_deleted states:", res.rows);
        
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
debug();
