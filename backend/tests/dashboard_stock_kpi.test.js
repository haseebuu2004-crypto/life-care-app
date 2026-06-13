require('dotenv').config();
const db = require('../shared/db/connection');
const dashboardService = require('../features/dashboard/dashboard.service');
const cacheService = require('../shared/services/cacheService');
const { v4: uuidv4 } = require('uuid');
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
        await db.query("INSERT INTO admin_config (owner_id, low_stock_threshold) VALUES ($1, 10)", [ownerId]);
        
        // Product
        const prodRes = await db.query("INSERT INTO products (id, owner_id, name) VALUES ($1, $2, 'Test Product') RETURNING id", [uuidv4(), ownerId]);
        productId = prodRes.rows[0].id;
        
        // Version (vendor_price = 100)
        const verRes = await db.query("INSERT INTO product_versions (id, product_id, is_active, version_label, vendor_price) VALUES ($1, $2, true, '1', 100) RETURNING id", [uuidv4(), productId]);
        versionId = verRes.rows[0].id;
        
        // Variant
        const varRes = await db.query("INSERT INTO variants (id, owner_id, product_version_id, name) VALUES ($1, $2, $3, 'Standard') RETURNING id", [uuidv4(), ownerId, versionId]);
        variantId = varRes.rows[0].id;
        
        // Stock: we intentionally set vendor_price_snap to NULL to simulate the bug (or maybe it is just the bug of using snap instead of pv.vendor_price)
        // Actually, if we set vendor_price_snap = NULL it throws error if NOT NULL constraint exists. Let's see if NOT NULL constraint exists.
        // The error from earlier test was: null value in column "vendor_price_snap" of relation "stock" violates not-null constraint
        // So vendor_price_snap IS NOT NULL. So the bug might be that vendor_price_snap is 0? 
        // Wait, why would "dashboard KPI always display zero"?
        // Wait! The user says "missing JOIN, incorrect column reference, or a WHERE clause that filters out all rows"
        // Let's look at the query: WHERE s.owner_id = $1 AND pv.is_active = true
        // But stock module does: JOIN products p ON pv.product_id = p.id WHERE p.owner_id = $1 AND pv.is_active = true
        // Wait... stock module uses `WHERE p.owner_id = $1` but dashboard uses `WHERE s.owner_id = $1`.
        // Does stock table have `owner_id` properly set? Yes, s.owner_id = $1.
        
        // Let's insert a stock with vendor_price_snap = 0 just to see if the dashboard KPI is 0, while the stock module uses pv.vendor_price = 100?
        await db.query("INSERT INTO stock (product_version_id, variant_id, owner_id, quantity, vendor_price_snap) VALUES ($1, $2, $3, 10, 50)", [versionId, variantId, ownerId]);

        await cacheService.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
        let stats = await dashboardService.getStats(ownerId);
        
        // We expect total inventory value to be SUM(quantity * pv.vendor_price) = 10 * 100 = 1000. Service divides by 100 -> 10.
        console.log("totalStockVpValue:", stats.data.totals.totalStockVpValue);
        assert.strictEqual(parseInt(stats.data.totals.totalStockVpValue), 10);
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
runTests();
