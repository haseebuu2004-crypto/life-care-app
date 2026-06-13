require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    // Check customers table
    const custCols = await p.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customers' ORDER BY ordinal_position");
    console.log("=== customers table ===");
    custCols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
    
    // Check sales table
    const salesCols = await p.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sales' ORDER BY ordinal_position");
    console.log("\n=== sales table ===");
    salesCols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
    
    // Check sale_items table
    const siCols = await p.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sale_items' ORDER BY ordinal_position");
    console.log("\n=== sale_items table ===");
    siCols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));

    // Check attendance table
    const attCols = await p.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'attendance' ORDER BY ordinal_position");
    console.log("\n=== attendance table ===");
    attCols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));

    await p.end();
}
run();
