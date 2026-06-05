require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testUpsert() {
    const ownerId = 'c02888ab-d421-4f93-8cfb-6a95dc6c9634'; // Need the actual owner_id
    // Wait, let's just fetch the record
    const record = await pool.query(`SELECT * FROM attendance WHERE id = 'b65693b5-7178-4e57-a1c9-53b4c8a40ba8'`);
    console.log("Original:", record.rows[0]);
    
    const { owner_id, customer_id, attendance_date, recorded_by } = record.rows[0];
    
    const attRes = await pool.query(`
        INSERT INTO attendance (owner_id, customer_id, attendance_date, type, shake_amount, recorded_by, is_deleted)
        VALUES ($1, $2, $3, $4, $5, $6, false)
        ON CONFLICT (owner_id, customer_id, attendance_date) DO UPDATE 
        SET 
            is_deleted = false,
            type = EXCLUDED.type,
            shake_amount = EXCLUDED.shake_amount,
            recorded_by = EXCLUDED.recorded_by,
            deleted_at = null
        WHERE attendance.is_deleted = true
        RETURNING id
    `, [owner_id, customer_id, attendance_date, 'default', 5000, recorded_by]);

    console.log("UPSERT rowCount:", attRes.rowCount);
    console.log("UPSERT returned:", attRes.rows);
    
    // reset it back
    await pool.query(`UPDATE attendance SET is_deleted = true WHERE id = $1`, [record.rows[0].id]);
    process.exit(0);
}
testUpsert();
