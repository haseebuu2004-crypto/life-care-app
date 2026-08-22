require('dotenv').config();
const db = require('./shared/db/connection');

async function cleanup() {
    try {
        const { rows } = await db.pool.query("SELECT id FROM products WHERE name LIKE 'TestProduct_%'");
        const ids = rows.map(r => r.id);
        
        if (ids.length === 0) {
            console.log("No test products found.");
            return;
        }

        console.log(`Found ${ids.length} test products to delete:`, ids);

        for (const pid of ids) {
            console.log(`Cleaning up product ${pid}...`);
            // Delete variants tied to the product's versions
            await db.pool.query("DELETE FROM variants WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [pid]);
            // Delete product versions
            await db.pool.query("DELETE FROM product_versions WHERE product_id = $1", [pid]);
            // Delete product
            await db.pool.query("DELETE FROM products WHERE id = $1", [pid]);
        }
        
        console.log("Cleanup complete!");
    } catch (e) {
        console.error("Cleanup failed:", e);
    } finally {
        await db.pool.end();
    }
}

cleanup();
