const pool = require('../shared/db/connection');

async function validate() {
    console.log('Starting Inventory Integrity Validation...');
    const client = await pool.pool.connect();
    let hasErrors = false;

    try {
        // 1. Check for Duplicate Variants in same product version
        const duplicates = await client.query(`
            SELECT product_version_id, LOWER(TRIM(name)) as normalized_name, COUNT(*)
            FROM variants
            GROUP BY product_version_id, LOWER(TRIM(name))
            HAVING COUNT(*) > 1
        `);

        if (duplicates.rows.length > 0) {
            console.error('❌ ERROR: Found duplicate variants within the same product version!');
            console.error(duplicates.rows);
            hasErrors = true;
        } else {
            console.log('✅ No duplicate variants found.');
        }

        // 2. Check for Duplicate SKUs
        const duplicateSkus = await client.query(`
            SELECT sku, COUNT(*)
            FROM variants
            WHERE sku IS NOT NULL AND sku != ''
            GROUP BY sku
            HAVING COUNT(*) > 1
        `);

        if (duplicateSkus.rows.length > 0) {
            console.error('❌ ERROR: Found duplicate SKUs!');
            console.error(duplicateSkus.rows);
            hasErrors = true;
        } else {
            console.log('✅ No duplicate SKUs found.');
        }

        // 3. Check for Orphan Stock Records
        // Stock must have a valid variant_id (since we ensured it previously)
        const orphanStock = await client.query(`
            SELECT id FROM stock
            WHERE variant_id IS NOT NULL AND variant_id NOT IN (SELECT id FROM variants)
        `);

        if (orphanStock.rows.length > 0) {
            console.error(`❌ ERROR: Found ${orphanStock.rows.length} orphan stock records with invalid variant_id!`);
            hasErrors = true;
        } else {
            console.log('✅ No orphan stock records found.');
        }

        // 4. Check for Orphan Sales Records
        // sale_items must have a valid variant_id
        // We only check rows where variant_id is set
        const orphanSales = await client.query(`
            SELECT id FROM sale_items
            WHERE variant_id IS NOT NULL AND variant_id NOT IN (SELECT id FROM variants)
        `);

        if (orphanSales.rows.length > 0) {
            console.error(`❌ ERROR: Found ${orphanSales.rows.length} orphan sale_items records with invalid variant_id!`);
            hasErrors = true;
        } else {
            console.log('✅ No orphan sales records found.');
        }

        if (hasErrors) {
            console.error('❌ VALIDATION FAILED. Do not proceed with deployment.');
            process.exit(1);
        } else {
            console.log('✅ VALIDATION PASSED.');
            process.exit(0);
        }

    } catch (e) {
        console.error('❌ Validation script crashed:', e);
        process.exit(1);
    } finally {
        client.release();
        pool.pool.end();
    }
}

validate();
