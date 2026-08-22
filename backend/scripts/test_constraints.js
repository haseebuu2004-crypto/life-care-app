require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const consts = await p.query("SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name='stock'");
    console.log("=== Stock Constraints ===");
    consts.rows.forEach(r => console.log(`${r.constraint_name} (${r.constraint_type})`));
    await p.end();
}
run();
