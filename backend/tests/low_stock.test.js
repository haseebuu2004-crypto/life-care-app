require('dotenv').config();
const db = require('../shared/db/connection');
const dashboardService = require('../features/dashboard/dashboard.service');
const { randomUUID: uuidv4 } = require('crypto');
const assert = require('assert');

async function runTests() {
    let ownerId = uuidv4();
    let productId;
    let versionId;
    let variantId;

    try {
        console.log("Setting up data...");
        // Setup base data
        await db.query("INSERT INTO users (id, owner_id, email, password_hash, role) VALUES ($1, $2, $3, 'hash', 'admin')", [ownerId, ownerId, 'test_' + ownerId + '@test.com']);
        
        // Tenant threshold
        await db.query("INSERT INTO admin_config (owner_id, low_stock_threshold) VALUES ($1, 10)", [ownerId]);
        
        // Product
        const prodRes = await db.query("INSERT INTO products (id, owner_id, name) VALUES ($1, $2, 'Test Product') RETURNING id", [uuidv4(), ownerId]);
        productId = prodRes.rows[0].id;
        
        // Version
        const verRes = await db.query("INSERT INTO product_versions (id, product_id, is_active, version_label, vendor_price) VALUES ($1, $2, true, '1', 100) RETURNING id", [uuidv4(), productId]);
        versionId = verRes.rows[0].id;
        
        // Variant
        const varRes = await db.query("INSERT INTO variants (id, owner_id, product_version_id, name, low_stock_threshold, alert_enabled, is_active) VALUES ($1, $2, $3, 'Standard', 10, true, true) RETURNING id", [uuidv4(), ownerId, versionId]);
        variantId = varRes.rows[0].id;
        
        // Stock
        await db.query("INSERT INTO stock (id, product_version_id, variant_id, owner_id, quantity, vendor_price_snap) VALUES ($1, $2, $3, $4, 15, 100)", [uuidv4(), versionId, variantId, ownerId]);

        console.log("Running Test 1: all items above threshold -> counter = 0");
        let stats = await dashboardService.getStats(ownerId);
        assert.strictEqual(parseInt(stats.data.totals.lowStockCount), 0);
        assert.strictEqual(stats.data.lowStockItems.length, 0);
        console.log("Test 1 passed!");

        console.log("Running Test 2: one item below -> counter = 1");
        await db.query("UPDATE stock SET quantity = 9 WHERE owner_id = $1", [ownerId]);
        await require('../shared/services/cacheService').invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
        stats = await dashboardService.getStats(ownerId);
        assert.strictEqual(parseInt(stats.data.totals.lowStockCount), 1);
        assert.strictEqual(stats.data.lowStockItems.length, 1);
        console.log("Test 2 passed!");

        console.log("Running Test 3: threshold updated -> counter recalculates immediately");
        await db.query("UPDATE variants SET low_stock_threshold = 5 WHERE owner_id = $1", [ownerId]);
        await require('../shared/services/cacheService').invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
        stats = await dashboardService.getStats(ownerId);
        assert.strictEqual(parseInt(stats.data.totals.lowStockCount), 0);
        assert.strictEqual(stats.data.lowStockItems.length, 0);
        console.log("Test 3 passed!");
        
        console.log("All tests passed successfully.");
    } catch(e) {
        console.error("Test failed:", e);
        process.exitCode = 1;
    } finally {
        // Cleanup
        console.log("Cleaning up data...");
        await db.query("DELETE FROM stock WHERE owner_id = $1", [ownerId]);
        await db.query("DELETE FROM variants WHERE owner_id = $1", [ownerId]);
        await db.query("DELETE FROM product_versions WHERE product_id = $1", [productId]);
        await db.query("DELETE FROM products WHERE id = $1", [productId]);
        await db.query("DELETE FROM admin_config WHERE owner_id = $1", [ownerId]);
        await db.query("DELETE FROM users WHERE owner_id = $1", [ownerId]);
        await db.pool.end();
    }
}
test('low stock test', async () => {
    await runTests();
}, 30000);
