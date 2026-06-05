const db = require('./db');

async function test() {
    const adminEmail = 'haseebuu2004@gmail.com';
    const result = await db.query('SELECT id, owner_id FROM users WHERE email = $1', [adminEmail]);
    const admin = result.rows[0];
    
    console.log("Admin details:", admin);
    
    // get a customer
    const custRes = await db.query('SELECT id FROM customers LIMIT 1');
    const customerId = custRes.rows[0].id;
    console.log("Customer ID:", customerId);
    
    // Simulate add attendance logic
    const ownerId = admin.owner_id || admin.id;
    const recordedBy = admin.id;
    const date = "2026-06-02";
    const type = 'default';
    
    const conf = await db.query(`SELECT default_shake_amount FROM admin_config WHERE owner_id = $1`, [ownerId]);
    const shakeProfit = (conf.rows[0]?.default_shake_amount || 0) / 100;
    const shakeAmountPaise = Math.round(Number(shakeProfit || 0) * 100);
    
    try {
        const attRes = await db.query(`
            INSERT INTO attendance (owner_id, customer_id, attendance_date, type, shake_amount, recorded_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (owner_id, customer_id, attendance_date) DO NOTHING
            RETURNING id
        `, [ownerId, customerId, new Date(date), type, shakeAmountPaise, recordedBy]);
        
        console.log("Result row count:", attRes.rowCount);
    } catch (e) {
        console.error("Error inserting:", e);
    }
    
    process.exit(0);
}

test();
