const db = require('./shared/db/connection');
const authService = require('./features/auth/auth.service');
const http = require('http');

async function testHttpStats() {
    console.log("Mocking a database session using authService...");
    const client = await db.pool.connect();
    
    // 1. Get user
    const userRes = await client.query('SELECT id FROM users LIMIT 1');
    const userId = userRes.rows[0].id;
    client.release();
    
    // 2. Insert valid session
    const fakeToken = await authService.createNewSession(userId, '127.0.0.1', 'test_script');

    console.log(`Session inserted for user ${userId}.`);

    // 3. Make HTTP request to local server
    console.log("Sending GET http://localhost:3000/api/dashboard/stats");
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/dashboard/stats',
        method: 'GET',
        headers: {
            'Cookie': `session_token=${fakeToken}`
        }
    };

    const req = http.request(options, (res) => {
        console.log(`\nHTTP STATUS: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', async () => {
            console.log("--- RESPONSE PAYLOAD ---");
            try {
                console.log(JSON.stringify(JSON.parse(data), null, 2));
            } catch(e) {
                console.log(data);
            }
            console.log("------------------------");
            
            // Clean up session
            await authService.logout(fakeToken, userId);
            process.exit(0);
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
        process.exit(1);
    });

    req.end();
}

testHttpStats();
