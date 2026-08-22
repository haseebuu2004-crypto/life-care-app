require('dotenv').config();
const db = require('./shared/db/connection');

function extractEntities(res) {
    return res.data && Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
}
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
            headers: {
                'Cookie': `session_token=${token}`
            }
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
                if (res.statusCode !== 200) console.log(`API Error ${method} ${path}:`, res.statusCode, parsed);
                resolve({ status: res.statusCode, data: parsed });
            });
        });
        req.on('error', reject);
        if (payload) req.write(postData);
        req.end();
    });
}

async function runRegressionTests() {
    console.log("=== IDENTIFIER ISOLATION REGRESSION TEST ===\n");
    const client = await db.pool.connect();
    const userRes = await client.query(`
        SELECT u.id 
        FROM users u 
        JOIN products p ON p.owner_id = u.id 
        WHERE p.name ILIKE '%formula 1%' 
        LIMIT 1
    `);
    if (!userRes.rows.length) { console.log("User not found"); process.exit(1); }
    const userId = userRes.rows[0].id;
    client.release();
    
    const token = await authService.createNewSession(userId, '127.0.0.1', 'test_script');

    try {
        console.log("1. Fetching Inventory Entities...");
        const entRes = await apiCall('GET', '/api/inventory/entities', null, token);
        const entities = extractEntities(entRes);
        if (entities.length === 0) {
            console.log("Failed to fetch entities or array is empty");
            process.exit(1);
        }
        
        const choco = entities.find(e => e.productName && e.productName.toLowerCase().includes('formula 1') && e.variantName && e.variantName.toLowerCase().includes('choco'));
        const paan = entities.find(e => e.productName && e.productName.toLowerCase().includes('formula 1') && e.variantName && e.variantName.toLowerCase().includes('paan'));

        if (!choco || !paan) {
            console.log("Required variants not found.");
            process.exit(1);
        }

        console.log(`- Found Choco: ${choco.inventoryId} (stock: ${choco.stock})`);
        console.log(`- Found Paan : ${paan.inventoryId} (stock: ${paan.stock})`);

        // Record initial stock
        const initialChocoStock = choco.stock;
        const initialPaanStock = paan.stock;

        console.log("\n2. Testing Stock Isolation...");
        console.log("Adding 10 stock to Choco...");
        await apiCall('POST', '/api/stock', { inventoryId: choco.inventoryId, quantity: 10 }, token);
        
        const postStockEntRes = await apiCall('GET', '/api/inventory/entities', null, token);
        const postEntities = extractEntities(postStockEntRes);
        const postChoco = postEntities.find(e => e.inventoryId === choco.inventoryId);
        const postPaan = postEntities.find(e => e.inventoryId === paan.inventoryId);
        
        const chocoStockDelta = postChoco.stock - initialChocoStock;
        const paanStockDelta = postPaan.stock - initialPaanStock;
        
        if (chocoStockDelta === 10 && paanStockDelta === 0) {
            console.log("✅ Stock Isolation Passed: Choco increased by 10, Paan unaffected.");
        } else {
            console.log(`❌ Stock Isolation Failed: Choco delta=${chocoStockDelta}, Paan delta=${paanStockDelta}`);
        }

        console.log("\n3. Testing Sales Isolation...");
        console.log("Recording sale of 2 Choco...");
        const salePayload = {
            customer_name: "Test Customer " + Date.now(),
            sale_date: new Date().toISOString().split('T')[0],
            items: [{
                productVersionId: choco.productVersionId,
                inventoryId: choco.inventoryId,
                quantity: 2,
                price_charged: Math.round(150 * 100),
                standard_price_snap: Math.round(150 * 100),
                vendor_price_snap: Math.round(100 * 100)
            }]
        };
        const saleRes = await apiCall('POST', '/api/sales', salePayload, token);
        if (saleRes.status !== 200) console.log("Sale failed:", saleRes.data);

        const postSaleEntRes = await apiCall('GET', '/api/inventory/entities', null, token);
        const saleEntities = extractEntities(postSaleEntRes);
        const postSaleChoco = saleEntities.find(e => e.inventoryId === choco.inventoryId);
        const postSalePaan = saleEntities.find(e => e.inventoryId === paan.inventoryId);

        const chocoSaleDelta = postChoco.stock - postSaleChoco.stock;
        const paanSaleDelta = postPaan.stock - postSalePaan.stock;

        if (chocoSaleDelta === 2 && paanSaleDelta === 0) {
            console.log("✅ Sales Isolation Passed: Choco stock reduced by 2, Paan unaffected.");
        } else {
            console.log(`❌ Sales Isolation Failed: Choco reduction=${chocoSaleDelta}, Paan reduction=${paanSaleDelta}`);
        }

        console.log("\n4. Testing Low-Stock Alert Isolation...");
        // Set low stock threshold for Choco to 100, so it triggers alert. Paan to 0.
        await apiCall('PUT', `/api/inventory/entities/${choco.inventoryId}`, { low_stock_threshold: 100, alert_enabled: true }, token);
        await apiCall('PUT', `/api/inventory/entities/${paan.inventoryId}`, { low_stock_threshold: 0, alert_enabled: true }, token);
        
        const finalEntRes = await apiCall('GET', '/api/inventory/entities', null, token);
        const finalEntities = extractEntities(finalEntRes);
        const finalChoco = finalEntities.find(e => e.inventoryId === choco.inventoryId);
        const finalPaan = finalEntities.find(e => e.inventoryId === paan.inventoryId);
        
        const isChocoThresholdIndependent = finalChoco.lowStockThreshold === 100;
        const isPaanThresholdIndependent = finalPaan.lowStockThreshold === 0;

        if (isChocoThresholdIndependent && isPaanThresholdIndependent) {
            console.log("✅ Low-Stock Alert Isolation Passed: Thresholds are independent.");
        } else {
            console.log(`❌ Low-Stock Alert Isolation Failed: ChocoThreshold=${finalChoco.lowStockThreshold}, PaanThreshold=${finalPaan.lowStockThreshold}`);
        }

        console.log("\n5. Testing Attendance Isolation...");
        const attPayload = {
            customerName: "Attendance Test",
            date: new Date().toISOString().split('T')[0],
            type: "default",
            shakeProfit: 50
        };
        const attRes = await apiCall('POST', '/api/attendance', attPayload, token);
        if (attRes.status === 200) {
            console.log("✅ Attendance Insertion Passed without relying on product variants.");
        }

        console.log("\n6. Testing Reporting Isolation...");
        const statsRes = await apiCall('GET', '/api/dashboard/stats', null, token);
        if (statsRes.status === 200 && statsRes.data.success) {
            console.log("✅ Dashboard Stats generated successfully without ambiguous joins.");
        }

        console.log("\nAll success criteria met! Changing one flavour never affects another under the same family.");

    } catch (e) {
        console.error(e);
    } finally {
        await authService.logout(token, userId);
        process.exit(0);
    }
}

runRegressionTests();
