require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        let count1 = 0, count2 = 0;
        try {
            const res = await pool.query("SELECT COUNT(*) FROM variants WHERE name IS NULL OR TRIM(name) = ''");
            count1 = res.rows[0].count;
        } catch (e) {
            console.log("Error querying variants:", e.message);
        }
        
        try {
            const res2 = await pool.query("SELECT COUNT(*) FROM product_variants WHERE flavor IS NULL OR TRIM(flavor) = ''");
            count2 = res2.rows[0].count;
        } catch (e) {
            console.log("Error querying product_variants:", e.message);
        }
        
        console.log(`Blank variants count (variants table): ${count1}`);
        console.log(`Blank variants count (product_variants table): ${count2}`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
