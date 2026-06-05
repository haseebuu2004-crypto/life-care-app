require('dotenv').config();
const pool = require('./config/db');

async function test() {
    const res = await pool.query('SELECT * FROM stock LIMIT 1');
    console.log(res.rows);
    process.exit(0);
}
test();
