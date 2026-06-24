require('dotenv').config();
const db = require('../shared/db/connection');
const dashboardService = require('../features/dashboard/dashboard.service');
const cacheService = require('../shared/services/cacheService');
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
        await db.query("INSERT INTO users (id, owner_id, email, password_hash, role) VALUES ($1, $2, $3, 'hash', 'admin')", [ownerId, ownerId, 'test_filter_' + ownerId + '@test.com']);
        await db.query("INSERT INTO admin_config (owner_id, low_stock_threshold) VALUES ($1, 10)", [ownerId]);
        
        // Product
        const prodRes = await db.query("INSERT INTO products (id, owner_id, name) VALUES ($1, $2, 'Test Product') RETURNING id", [uuidv4(), ownerId]);
        productId = prodRes.rows[0].id;
        
        const verRes = await db.query("INSERT INTO product_versions (id, product_id, is_active, version_label, vendor_price) VALUES ($1, $2, true, '1', 100) RETURNING id", [uuidv4(), productId]);
        versionId = verRes.rows[0].id;
        
        const varRes = await db.query("INSERT INTO variants (id, owner_id, product_version_id, name, low_stock_threshold, alert_enabled, is_active) VALUES ($1, $2, $3, 'Standard', 10, true, true) RETURNING id", [uuidv4(), ownerId, versionId]);
        variantId = varRes.rows[0].id;
        
        // Stock 10 * 100 = 1000
        await db.query("INSERT INTO stock (id, product_version_id, variant_id, owner_id, quantity, vendor_price_snap) VALUES ($1, $2, $3, $4, 10, 50)", [uuidv4(), versionId, variantId, ownerId]);

        await cacheService.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);

        // Test with Date Range 1
        let stats1 = await dashboardService.getStats(ownerId, '2026-06-01', '2026-06-05');
        
        // Simulate an external change to the stock WITHOUT invalidating cache for this test?
        // Wait, if we change the stock, it normally invalidates the cache. 
        // We just want to ensure that fetching a DIFFERENT date range gives the SAME point-in-time metrics if no stock change occurred.
        // Wait, what if we DO change the stock, but we manually don't invalidate the cache? (this mimics what happened when caches split).
        // If we change the stock, it's supposed to invalidate the cache.
        // But what if we just fetch stats2 with a different date range, and assert the PIT metric is exactly the same?
        
        let stats2 = await dashboardService.getStats(ownerId, '2026-06-06', '2026-06-10');

        console.log("totalStockVpValue 1:", stats1.data.totals.totalStockVpValue);
        console.log("totalStockVpValue 2:", stats2.data.totals.totalStockVpValue);

        assert.strictEqual(stats1.data.totals.totalStockVpValue, stats2.data.totals.totalStockVpValue);
        console.log("PIT metrics remained constant across date filters!");

        // Simulate a stock change and trigger invalidation
        await db.query("UPDATE stock SET quantity = 5 WHERE owner_id = $1", [ownerId]);
        await cacheService.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);

        let stats3 = await dashboardService.getStats(ownerId, '2026-06-01', '2026-06-05');
        console.log("totalStockVpValue 3:", stats3.data.totals.totalStockVpValue);
        assert.strictEqual(parseInt(stats3.data.totals.totalStockVpValue), 5); // 500 / 100 = 5

        // Let's test that if we don't invalidate cache, but we change date range, we STILL get the cached PIT metric!
        // No wait! If we change the date range, the PERIOD metric is a cache miss, but the PIT metric is a cache HIT!
        await db.query("UPDATE stock SET quantity = 2 WHERE owner_id = $1", [ownerId]);
        // Do NOT invalidate cache!
        let stats4 = await dashboardService.getStats(ownerId, '2026-06-11', '2026-06-15');
        console.log("totalStockVpValue 4 (cache hit for PIT):", stats4.data.totals.totalStockVpValue);
        // PIT should be 5 because it was cached under PIT key, even though date range changed to 11-15!
        assert.strictEqual(parseInt(stats4.data.totals.totalStockVpValue), 5);

        console.log("Test passed!");
    } catch(e) {
        console.error("Test failed:", e);
        process.exitCode = 1;
    } finally {
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
test('dashboard filter kpi test', async () => {
    await runTests();
}, 30000);
