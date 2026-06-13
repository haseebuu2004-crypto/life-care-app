const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function checkConstraints() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    for (const table of ['stock', 'sale_items']) {
        const res = await client.query(`
            SELECT conname, contype, pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid::regclass::text = $1;
        `, [table]);
        console.log(`--- ${table} constraints ---`);
        console.log(res.rows);
    }
    
    await client.end();
}

checkConstraints();
