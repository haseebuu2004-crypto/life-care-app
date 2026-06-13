const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function checkNulls() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    const res = await client.query("SELECT * FROM products");
    console.log('Products:', res.rows.length);
    console.log('Valid IDs:', res.rows.filter(r => r.id !== null).length);
    
    const res2 = await client.query("SELECT * FROM product_versions");
    console.log('Valid PVs:', res2.rows.filter(r => r.id !== null).length);
    
    const res3 = await client.query("SELECT * FROM variants");
    console.log('Valid Variants:', res3.rows.filter(r => r.id !== null).length);
    
    const res4 = await client.query("SELECT * FROM stock");
    console.log('Valid Stock:', res4.rows.filter(r => r.id !== null).length);
    console.log('Null Stock:', res4.rows.filter(r => r.id === null).length);

    await client.end();
}

checkNulls();
