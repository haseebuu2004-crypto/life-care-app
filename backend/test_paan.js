require('dotenv').config();
const db = require('./shared/db/connection');
const authService = require('./features/auth/auth.service');
const http = require('http');

function apiCall(method, path, payload, token) {
    return new Promise((resolve, reject) => {
        const postData = payload ? JSON.stringify(payload) : '';
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: { 'Cookie': `session_token=${token}` }
        };
        if (payload) {
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }
        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try { parsed = JSON.parse(data); } catch (e) {}
                resolve({ status: res.statusCode, data: parsed });
            });
        });
        req.on('error', reject);
        if (payload) req.write(postData);
        req.end();
    });
}

function extractEntities(res) {
    return res.data && Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
}

async function run() {
    const client = await db.pool.connect();
    const userRes = await client.query(`SELECT u.id FROM users u JOIN products p ON p.owner_id = u.id WHERE p.name ILIKE '%formula 1%' LIMIT 1`);
    const userId = userRes.rows[0].id;
    client.release();
    const token = await authService.createNewSession(userId, '127.0.0.1', 'test_script');

    const entRes = await apiCall('GET', '/api/inventory/entities', null, token);
    const entities = extractEntities(entRes);
    const paan = entities.find(e => e.productName && e.productName.toLowerCase().includes('formula 1') && e.variantName && e.variantName.toLowerCase().includes('paan'));
    const choco = entities.find(e => e.productName && e.productName.toLowerCase().includes('formula 1') && e.variantName && e.variantName.toLowerCase().includes('choco'));
    
    console.log("Before:");
    console.log("Paan stock:", paan.stock, "Id:", paan.inventoryId);
    console.log("Choco stock:", choco.stock, "Id:", choco.inventoryId);

    console.log("\nAdding 10 to Paan...");
    await apiCall('POST', '/api/stock', { inventoryId: paan.inventoryId, quantity: 10 }, token);

    const postEntRes = await apiCall('GET', '/api/inventory/entities', null, token);
    const postEntities = extractEntities(postEntRes);
    const postPaan = postEntities.find(e => e.inventoryId === paan.inventoryId);
    const postChoco = postEntities.find(e => e.inventoryId === choco.inventoryId);

    console.log("\nAfter:");
    console.log("Paan stock:", postPaan.stock);
    console.log("Choco stock:", postChoco.stock);

    await authService.logout(token, userId);
    process.exit(0);
}
run();
