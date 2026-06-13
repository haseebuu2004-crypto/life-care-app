require('dotenv').config();
const pool = require('./shared/db/connection');

async function test() {
    const res = await pool.query('SELECT * FROM backup_logs ORDER BY created_at DESC LIMIT 5');
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
}
test();
