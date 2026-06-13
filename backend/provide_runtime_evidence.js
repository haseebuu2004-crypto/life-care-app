const db = require('./shared/db/connection');
const authService = require('./features/auth/auth.service');
const http = require('http');

async function provideRuntimeEvidence() {
    console.log("=== RUNTIME EVIDENCE SCRIPT ===");
    const client = await db.pool.connect();
    
    // 1. Get user
    const userRes = await client.query('SELECT id FROM users LIMIT 1');
    const userId = userRes.rows[0].id;
    client.release();
    
    // 2. Insert valid session
    const fakeToken = await authService.createNewSession(userId, '127.0.0.1', 'test_script');

    // 3. Fetch Inventory Entities (simulating fetchInventoryEntities)
    const fetchOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/inventory/entities',
        method: 'GET',
        headers: { 'Cookie': `session_token=${fakeToken}` }
    };

    const entities = await new Promise((resolve, reject) => {
        const req = http.request(fetchOptions, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.end();
    });

    // 4. Simulate Frontend Selection (formula 1 | choco)
    const selectedEntity = entities.find(e => 
        e.productName.toLowerCase().includes('formula 1') && 
        e.variantName.toLowerCase().includes('choco')
    );

    if (!selectedEntity) {
        console.log("Could not find 'formula 1 | choco' in inventory entities.");
        await authService.logout(fakeToken, userId);
        process.exit(1);
    }

    console.log("\n[Frontend] selectedEntity before submission:");
    console.log(selectedEntity);

    // 5. Simulate Frontend Payload Creation
    const payload = {
        inventoryId: selectedEntity.inventoryId,
        quantity: 10
    };

    console.log("\n[Frontend] request payload before API call:");
    console.log(payload);

    // 6. Send Add Stock Request
    const postData = JSON.stringify(payload);
    const postOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/stock',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Cookie': `session_token=${fakeToken}`
        }
    };

    const result = await new Promise((resolve, reject) => {
        const req = http.request(postOptions, res => {
            console.log(`\n[Backend] HTTP POST /api/stock Status: ${res.statusCode}`);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });

    console.log("[Backend] Response body:");
    console.log(result);

    // 7. Verify inserted stock row in DB
    const stockClient = await db.pool.connect();
    const stockRes = await stockClient.query(
        'SELECT id, product_version_id, variant_id, quantity, added_at FROM stock WHERE variant_id = $1 ORDER BY added_at DESC LIMIT 1', 
        [selectedEntity.inventoryId]
    );
    stockClient.release();

    console.log("\n[Database] successful stock insertion row:");
    console.log(stockRes.rows[0]);

    // Clean up
    await authService.logout(fakeToken, userId);
    process.exit(0);
}

provideRuntimeEvidence();
