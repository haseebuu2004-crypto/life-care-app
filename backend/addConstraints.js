const db = require('./db');

async function addConstraints() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        console.log("Adding constraints...");

        // 1. Unique Product Name (case-insensitive) per owner
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS unique_product_name_owner 
            ON products (owner_id, LOWER(name))
        `);
        console.log("Added unique constraint on products name.");

        // 2. Unique Active Product Version
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS unique_active_product_version 
            ON product_versions (product_id) 
            WHERE is_active = true
        `);
        console.log("Added unique active constraint on product_versions.");

        // 3. Unique Stock per version and owner
        // Since we are using UUIDs, a regular constraint works. Wait, stock is a regular table.
        await client.query(`
            ALTER TABLE stock DROP CONSTRAINT IF EXISTS unique_stock_version_owner
        `);
        await client.query(`
            ALTER TABLE stock ADD CONSTRAINT unique_stock_version_owner 
            UNIQUE (owner_id, product_version_id)
        `);
        console.log("Added unique constraint on stock.");

        // 4. Unique Flavour per product and name (case-insensitive)
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS unique_flavour_product_owner 
            ON flavours (product_id, owner_id, LOWER(name))
        `);
        console.log("Added unique constraint on flavours.");

        await client.query('COMMIT');
        console.log("Constraints added successfully.");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Constraint addition failed:", e);
    } finally {
        client.release();
    }
}

addConstraints().then(() => process.exit(0)).catch(() => process.exit(1));
