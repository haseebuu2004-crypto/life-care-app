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
            SELECT s.id 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE u.role = 'master' AND s.expires_at > NOW()
            LIMIT 1
        `);
        
        if (res.rows.length === 0) {
            console.log("No master session found. Cannot test.");
            return;
        }
        
        const sessionId = res.rows[0].id;
        console.log("Found session:", sessionId);
        
        const headers = {
            'Cookie': `session_token=${sessionId}`
        };
        
        console.log("Calling /api/master/stats...");
        let p1 = fetch('http://localhost:3000/api/master/stats', { headers }).then(r => r.json());
        
        console.log("Calling /api/master/sessions...");
        let p2 = fetch('http://localhost:3000/api/master/sessions', { headers }).then(r => r.json());
        
        console.log("Calling /api/master/audit-log...");
        let p3 = fetch('http://localhost:3000/api/master/audit-log', { headers }).then(r => r.json());
        
        console.log("Calling /api/master/admins...");
        let p4 = fetch('http://localhost:3000/api/master/admins', { headers }).then(r => r.json());
        
        const results = await Promise.all([p1, p2, p3, p4]);
        console.log("All requests completed successfully!");
        // console.log(results);
    } catch (e) {
        console.error("Test error:", e);
    } finally {
        await pool.end();
    }
}

runTest();
