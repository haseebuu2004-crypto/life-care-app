const db = require('./shared/db/connection');
const authService = require('./features/auth/auth.service');
const inventoryQueries = require('./features/inventory/inventory.queries');
const http = require('http');

async function testHttpStock() {
    console.log("Mocking a database session using authService...");
    const client = await db.pool.connect();
    
    // 1. Get user
    const userRes = await client.query('SELECT id FROM users LIMIT 1');
    const userId = userRes.rows[0].id;
    
    // 2. Find a variant
    const fetchRes = await inventoryQueries.getInventoryEntities(userId);
    if (fetchRes.rows.length === 0) {
        console.error("No inventory entities found. Please create a product first.");
        client.release();
        process.exit(1);
    }
    const variantId = fetchRes.rows[0].variant_id;
    console.log(`Found variant: ${fetchRes.rows[0].variant_name} | ID: ${variantId}`);
    client.release();
    
    // 3. Insert valid session
    const fakeToken = await authService.createNewSession(userId, '127.0.0.1', 'test_script');

    console.log(`Session inserted for user ${userId}.`);

    // 4. Make HTTP request to local server
    const payload = JSON.stringify({
        inventoryId: variantId,
        quantity: 10
    });

    console.log(`Sending POST http://localhost:3000/api/stock with payload: ${payload}`);
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/stock',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
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

    req.write(payload);
    req.end();
}

testHttpStock();
