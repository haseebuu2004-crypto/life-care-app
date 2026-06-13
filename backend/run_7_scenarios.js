require('dotenv').config();
const http = require('http');
const db = require('./shared/db/connection');
const authService = require('./features/auth/auth.service');

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
    
    // Setup - Find user
    const userRes = await client.query(`SELECT id FROM users LIMIT 1`);
    const userId = userRes.rows[0].id;
    const token = await authService.createNewSession(userId, '127.0.0.1', 'test_script');

    // Setup - Cleanup old test data
    await client.query(`DELETE FROM stock WHERE owner_id = $1`, [userId]);
    await client.query(`DELETE FROM variants WHERE name IN ('Choco', 'Paan', 'Mango', 'Base')`);
    await client.query(`DELETE FROM product_versions WHERE vendor_price IN ('1000', '1500')`);
    await client.query(`DELETE FROM products WHERE name IN ('Formula 1', 'Product B')`);

    // Setup - Create Formula 1
    const p1Res = await client.query(`INSERT INTO products (id, name, owner_id) VALUES (gen_random_uuid(), 'Formula 1', $1) RETURNING id`, [userId]);
    const f1Id = p1Res.rows[0].id;
    const pv1Res = await client.query(`INSERT INTO product_versions (id, product_id, vendor_price, volume_points, is_active) VALUES (gen_random_uuid(), $1, 1000, 10, true) RETURNING id`, [f1Id]);
    const pv1Id = pv1Res.rows[0].id;

    const vChocoRes = await client.query(`INSERT INTO variants (id, product_version_id, name, is_active) VALUES (gen_random_uuid(), $1, 'Choco', true) RETURNING id`, [pv1Id]);
    const vChoco = vChocoRes.rows[0].id;
    const vPaanRes = await client.query(`INSERT INTO variants (id, product_version_id, name, is_active) VALUES (gen_random_uuid(), $1, 'Paan', true) RETURNING id`, [pv1Id]);
    const vPaan = vPaanRes.rows[0].id;

    console.log("=== REGRESSION TEST START ===");

    // Fetch initial entities
    const getStock = async () => {
        const res = await apiCall('GET', '/api/inventory/entities', null, token);
        const ents = extractEntities(res);
        return {
            choco: ents.find(e => e.inventoryId === vChoco)?.stock || 0,
            paan: ents.find(e => e.inventoryId === vPaan)?.stock || 0
        };
    };

    // Scenario 1
    await apiCall('POST', '/api/stock', { inventoryId: vChoco, quantity: 10 }, token);
    let s1 = await getStock();
    console.log(`Scenario 1: Add Choco +10 -> Expected: Choco = 10, Paan = 0 | Result: Choco = ${s1.choco}, Paan = ${s1.paan} [${s1.choco===10 && s1.paan===0 ? 'PASS' : 'FAIL'}]`);

    // Scenario 2
    await apiCall('POST', '/api/stock', { inventoryId: vPaan, quantity: 10 }, token);
    let s2 = await getStock();
    console.log(`Scenario 2: Add Paan +10 -> Expected: Choco = 10, Paan = 10 | Result: Choco = ${s2.choco}, Paan = ${s2.paan} [${s2.choco===10 && s2.paan===10 ? 'PASS' : 'FAIL'}]`);

    // Scenario 3
    await apiCall('POST', '/api/stock', { inventoryId: vChoco, quantity: 20 }, token);
    let s3 = await getStock();
    console.log(`Scenario 3: Add Choco +20 -> Expected: Choco = 30, Paan = 10 | Result: Choco = ${s3.choco}, Paan = ${s3.paan} [${s3.choco===30 && s3.paan===10 ? 'PASS' : 'FAIL'}]`);

    // Scenario 4
    const custRes = await client.query(`INSERT INTO customers (id, owner_id, name, phone) VALUES (gen_random_uuid(), $1, 'Test Cust', '123456') RETURNING id`, [userId]);
    const custId = custRes.rows[0].id;
    await apiCall('POST', '/api/sales', {
        customer_id: custId,
        items: [{ inventoryId: vChoco, productVersionId: pv1Id, quantity: 5, price_charged: 1500 }]
    }, token);
    
    let s4 = await getStock();
    console.log(`Scenario 4: Sell Choco qty 5 -> Expected: Choco = 25, Paan = 10 | Result: Choco = ${s4.choco}, Paan = ${s4.paan} [${s4.choco===25 && s4.paan===10 ? 'PASS' : 'FAIL'}]`);

    // Scenario 5
    await client.query(`UPDATE variants SET low_stock_threshold = 20, alert_enabled = true WHERE id = $1`, [vChoco]);
    await client.query(`UPDATE variants SET low_stock_threshold = 5, alert_enabled = true WHERE id = $1`, [vPaan]);
    await apiCall('PUT', `/api/stock/${vChoco}`, { quantity: 15 }, token); // Drops to 15
    const s5Res = await apiCall('GET', '/api/inventory/entities', null, token);
    const s5Ents = extractEntities(s5Res);
    const s5Choco = s5Ents.find(e => e.inventoryId === vChoco);
    const s5Paan = s5Ents.find(e => e.inventoryId === vPaan);
    const chocoLow = s5Choco && s5Choco.stock <= s5Choco.lowStockThreshold && s5Choco.alertEnabled;
    const paanLow = s5Paan && s5Paan.stock <= s5Paan.lowStockThreshold && s5Paan.alertEnabled;
    console.log(`Scenario 5: Low-stock alert isolation -> Expected: Choco low (15<=20), Paan ok (10>5) | Result: Choco Low=${chocoLow}, Paan Low=${paanLow} [${chocoLow===true && paanLow===false ? 'PASS' : 'FAIL'}]`);

    // Scenario 6
    const vMangoRes = await client.query(`INSERT INTO variants (id, product_version_id, name, is_active) VALUES (gen_random_uuid(), $1, 'Mango', true) RETURNING id`, [pv1Id]);
    const vMango = vMangoRes.rows[0].id;
    await apiCall('POST', '/api/stock', { inventoryId: vMango, quantity: 5 }, token);
    const s6Res = await apiCall('GET', '/api/inventory/entities', null, token);
    const s6Ents = extractEntities(s6Res);
    const s6Choco = s6Ents.find(e => e.inventoryId === vChoco)?.stock;
    const s6Paan = s6Ents.find(e => e.inventoryId === vPaan)?.stock;
    const s6Mango = s6Ents.find(e => e.inventoryId === vMango)?.stock;
    console.log(`Scenario 6: Third flavour Mango +5 -> Expected: Choco = 15, Paan = 10, Mango = 5 | Result: Choco = ${s6Choco}, Paan = ${s6Paan}, Mango = ${s6Mango} [${s6Choco===15 && s6Paan===10 && s6Mango===5 ? 'PASS' : 'FAIL'}]`);

    // Scenario 7
    const p2Res = await client.query(`INSERT INTO products (id, name, owner_id) VALUES (gen_random_uuid(), 'Product B', $1) RETURNING id`, [userId]);
    const pbId = p2Res.rows[0].id;
    const pvbRes = await client.query(`INSERT INTO product_versions (id, product_id, vendor_price, volume_points, is_active) VALUES (gen_random_uuid(), $1, 1500, 15, true) RETURNING id`, [pbId]);
    const pvbId = pvbRes.rows[0].id;
    const vbRes = await client.query(`INSERT INTO variants (id, product_version_id, name, is_active) VALUES (gen_random_uuid(), $1, 'Base', true) RETURNING id`, [pvbId]);
    const vBase = vbRes.rows[0].id;
    
    await apiCall('POST', '/api/stock', { inventoryId: vBase, quantity: 20 }, token);
    const s7Res = await apiCall('GET', '/api/inventory/entities', null, token);
    const s7Ents = extractEntities(s7Res);
    const s7Choco = s7Ents.find(e => e.inventoryId === vChoco)?.stock;
    const s7Paan = s7Ents.find(e => e.inventoryId === vPaan)?.stock;
    const s7Mango = s7Ents.find(e => e.inventoryId === vMango)?.stock;
    const s7Base = s7Ents.find(e => e.inventoryId === vBase)?.stock;
    console.log(`Scenario 7: Product B +20 -> Expected: Product B = 20, Choco = 15, Paan = 10, Mango = 5 | Result: Product B = ${s7Base}, Choco = ${s7Choco}, Paan = ${s7Paan}, Mango = ${s7Mango} [${s7Base===20 && s7Choco===15 && s7Paan===10 && s7Mango===5 ? 'PASS' : 'FAIL'}]`);

    console.log("=== REGRESSION TEST COMPLETE ===");

    await client.query(`DELETE FROM stock WHERE owner_id = $1`, [userId]);
    await client.query(`DELETE FROM variants WHERE id IN ($1, $2, $3, $4)`, [vChoco, vPaan, vMango, vBase]);
    await client.query(`DELETE FROM product_versions WHERE id IN ($1, $2)`, [pv1Id, pvbId]);
    await client.query(`DELETE FROM products WHERE id IN ($1, $2)`, [f1Id, pbId]);
    await client.query(`DELETE FROM customers WHERE id = $1`, [custId]);

    client.release();
    process.exit(0);
}
run();
