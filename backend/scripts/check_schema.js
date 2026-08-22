const pool = require('./shared/db/connection');
async function run() {
    const client = await pool.pool.connect();
    const res = await client.query(`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('products', 'product_versions', 'variants', 'stock', 'sale_items') ORDER BY table_name, ordinal_position`);
    console.log(JSON.stringify(res.rows, null, 2));
    client.release();
    pool.pool.end();
}
run();
