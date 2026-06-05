const db = require('./db');

async function deduplicate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        console.log("Starting deduplication process...");

        // 1. Deduplicate Stock
        console.log("Deduplicating stock...");
        const stockRes = await client.query(`
            SELECT owner_id, product_version_id, array_agg(id) as ids, sum(quantity) as total_qty
            FROM stock
            GROUP BY owner_id, product_version_id
            HAVING count(id) > 1
        `);
        
        for (const row of stockRes.rows) {
            const ids = row.ids;
            const primaryId = ids[0];
            const duplicateIds = ids.slice(1);
            
            // Update primary
            await client.query(`UPDATE stock SET quantity = $1 WHERE id = $2`, [row.total_qty, primaryId]);
            
            // Delete duplicates
            for (const dup of duplicateIds) {
                await client.query(`DELETE FROM stock WHERE id = $1`, [dup]);
            }
            console.log(`Merged stock for version ${row.product_version_id}`);
        }

        // 2. Deduplicate Products
        console.log("Deduplicating products...");
        const productsRes = await client.query(`
            SELECT owner_id, LOWER(name) as lname, array_agg(id) as ids
            FROM products
            GROUP BY owner_id, LOWER(name)
            HAVING count(id) > 1
        `);

        for (const row of productsRes.rows) {
            const ids = row.ids;
            const primaryId = ids[0];
            const duplicateIds = ids.slice(1);

            for (const dup of duplicateIds) {
                // Re-point product_versions
                await client.query(`UPDATE product_versions SET product_id = $1 WHERE product_id = $2`, [primaryId, dup]);
                // Re-point flavours
                await client.query(`UPDATE flavours SET product_id = $1 WHERE product_id = $2`, [primaryId, dup]);
                // Delete duplicate product
                await client.query(`DELETE FROM products WHERE id = $1`, [dup]);
            }
            console.log(`Merged products for name ${row.lname}`);
        }

        // 3. Fix multiple active product_versions per product
        console.log("Fixing active product versions...");
        const activeVersionsRes = await client.query(`
            SELECT product_id, array_agg(id ORDER BY effective_from DESC NULLS LAST, id DESC) as ids
            FROM product_versions
            WHERE is_active = true
            GROUP BY product_id
            HAVING count(id) > 1
        `);

        for (const row of activeVersionsRes.rows) {
            const ids = row.ids;
            const primaryId = ids[0]; // Keep the newest one active
            const duplicateIds = ids.slice(1);

            for (const dup of duplicateIds) {
                await client.query(`UPDATE product_versions SET is_active = false WHERE id = $1`, [dup]);
            }
            console.log(`Fixed active versions for product ${row.product_id}`);
        }

        // 4. Deduplicate Flavours
        console.log("Deduplicating flavours...");
        const flavoursRes = await client.query(`
            SELECT owner_id, product_id, LOWER(name) as lname, array_agg(id) as ids
            FROM flavours
            GROUP BY owner_id, product_id, LOWER(name)
            HAVING count(id) > 1
        `);

        for (const row of flavoursRes.rows) {
            const ids = row.ids;
            const primaryId = ids[0];
            const duplicateIds = ids.slice(1);

            for (const dup of duplicateIds) {
                // Re-point sale_items
                await client.query(`UPDATE sale_items SET flavour_id = $1 WHERE flavour_id = $2`, [primaryId, dup]);
                // Delete duplicate flavour
                await client.query(`DELETE FROM flavours WHERE id = $1`, [dup]);
            }
            console.log(`Merged flavours for ${row.lname}`);
        }

        await client.query('COMMIT');
        console.log("Deduplication completed successfully.");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Deduplication failed:", e);
    } finally {
        client.release();
    }
}

deduplicate().then(() => process.exit(0)).catch(() => process.exit(1));
