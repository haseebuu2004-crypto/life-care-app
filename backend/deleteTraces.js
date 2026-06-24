require('dotenv').config();
const db = require('./db');

async function main() {
    try {
        const email = 'clubstock786@gmail.com';
        
        // Find the user ID
        const userRes = await db.query("SELECT id FROM users WHERE email = $1 OR email LIKE $2", [email, `%${email}`]);
        
        if (userRes.rows.length === 0) {
            console.log("User not found in the database.");
            process.exit(0);
        }
        
        const userId = userRes.rows[0].id;

        // 1. Delete audit_log records
        const au = await db.query("DELETE FROM audit_log WHERE actor_id = $1", [userId]);
        console.log(`Deleted ${au.rowCount} audit logs`);

        // 2. Delete sales recorded by this user
        const s1 = await db.query("DELETE FROM sales WHERE recorded_by = $1", [userId]);
        console.log(`Deleted ${s1.rowCount} sales`);

        // 3. Delete attendance recorded by this user
        const a1 = await db.query("DELETE FROM attendance WHERE recorded_by = $1", [userId]);
        console.log(`Deleted ${a1.rowCount} attendance`);

        // 4. Delete the user
        const u1 = await db.query("DELETE FROM users WHERE id = $1", [userId]);
        console.log(`Deleted ${u1.rowCount} user record`);

        await db.query("COMMIT");
        console.log("Deletion completed successfully.");
    } catch (e) {
        console.error("Error during deletion:", e);
        await db.query("ROLLBACK");
    } finally {
        process.exit(0);
    }
}

main();
