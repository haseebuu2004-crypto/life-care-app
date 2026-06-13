require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const tables = await p.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log("=== All Tables ===");
    tables.rows.forEach(r => console.log(r.table_name));

    const productTables = ['products', 'product_versions', 'flavours', 'product_variants', 'stock'];
    for (const t of productTables) {
        if (tables.rows.find(r => r.table_name === t)) {
            const cols = await p.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position", [t]);
            console.log(`\n=== ${t} table ===`);
            cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
        }
    }
    
    await p.end();
}
run();
