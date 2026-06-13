const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function checkNulls() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    for (const table of ['products', 'product_versions', 'variants']) {
        const res = await client.query(`SELECT * FROM ${table} WHERE id IS NULL LIMIT 5;`);
        console.log(`Table ${table} NULL id count:`, res.rows.length);
        if (res.rows.length > 0) {
            console.log(res.rows);
        }
    }
    
    await client.end();
}

checkNulls();
