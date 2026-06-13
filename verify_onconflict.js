const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function verifyOnConflict() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    const tables = ['customers', 'products', 'product_versions', 'variants', 'stock', 'sales', 'sale_items', 'attendance'];
    
    for (const table of tables) {
        try {
            // Attempt a query that will hit the ON CONFLICT clause
            // If there's no unique constraint, it will throw an error before executing the logic.
            await client.query(`EXPLAIN INSERT INTO ${table} (id) VALUES (null) ON CONFLICT (id) DO NOTHING`);
            console.log(`Table ${table} supports ON CONFLICT (id)`);
        } catch(e) {
            console.log(`Table ${table} FAILED:`, e.message);
        }
    }
    
    await client.end();
}

verifyOnConflict();
