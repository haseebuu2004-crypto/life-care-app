const fetch = require('node-fetch');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runTest() {
    try {
        console.log("Fetching master session...");
        const res = await pool.query(`
            SELECT s.id, u.id as admin_id
            FROM sessions s
            JOIN users u ON u.role = 'admin'
            WHERE s.expires_at > NOW() 
            LIMIT 1
        `);
        
        const masterRes = await pool.query(`
            SELECT s.id 
            FROM sessions s
            JOIN users u ON u.role = 'master'
            WHERE s.expires_at > NOW()
            LIMIT 1
        `);

        if (masterRes.rows.length === 0) {
            console.log("No master session found.");
            return;
        }
        
        const sessionId = masterRes.rows[0].id;
        const adminId = res.rows.length > 0 ? res.rows[0].admin_id : 1; // fallback
        
        const headers = {
            'Cookie': `session_token=${sessionId}`,
            'Content-Type': 'application/json'
        };
        
        console.log(`Toggling admin ${adminId}...`);
        const putRes = await fetch(`http://localhost:3000/api/master/admins/${adminId}/toggle-status`, { 
            method: 'PUT', 
            headers 
        });
        
        const putJson = await putRes.json();
        console.log("PUT Response:", putJson);
        
        console.log("Calling loadData endpoints...");
        const t1 = Date.now();
        let p1 = fetch('http://localhost:3000/api/master/stats', { headers }).then(r => r.json());
        let p2 = fetch('http://localhost:3000/api/master/sessions', { headers }).then(r => r.json());
        let p3 = fetch('http://localhost:3000/api/master/audit-log', { headers }).then(r => r.json());
        let p4 = fetch('http://localhost:3000/api/master/admins', { headers }).then(r => r.json());
        
        await Promise.all([p1, p2, p3, p4]);
        console.log(`All requests completed successfully in ${Date.now() - t1}ms!`);
    } catch (e) {
        console.error("Test error:", e);
    } finally {
        await pool.end();
    }
}

runTest();
