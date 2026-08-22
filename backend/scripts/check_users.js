require('dotenv').config();
const pool = require('./shared/db/connection');

async function check() {
    const res = await pool.query("SELECT email, role FROM users LIMIT 5");
    console.log(res.rows);
    process.exit(0);
}
check();
