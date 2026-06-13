const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function checkCols() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    const res = await client.query("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'product_versions'::regclass AND contype = 'f'");
    console.log('product_versions FKs:', res.rows);
    
    await client.end();
}

checkCols();
