const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function fixPrimaryKeys() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    const tables = ['products', 'product_versions', 'variants', 'stock', 'sale_items'];
    
    for (const table of tables) {
        // Delete rows with null IDs
        const delRes = await client.query(`DELETE FROM ${table} WHERE id IS NULL`);
        console.log(`Deleted ${delRes.rowCount} rows with NULL id from ${table}`);
        
        // Ensure id column is NOT NULL
        try {
            await client.query(`ALTER TABLE ${table} ALTER COLUMN id SET NOT NULL`);
            console.log(`Set NOT NULL on ${table}.id`);
        } catch(e) {
            console.error(`Error setting NOT NULL on ${table}:`, e.message);
        }
        
        // Add PRIMARY KEY
        try {
            await client.query(`ALTER TABLE ${table} ADD PRIMARY KEY (id)`);
            console.log(`Added PRIMARY KEY to ${table}`);
        } catch(e) {
            console.error(`Error adding PRIMARY KEY to ${table}:`, e.message);
        }
    }
    
    await client.end();
}

fixPrimaryKeys();
