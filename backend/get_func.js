require('dotenv').config();
const pool = require('./config/db');

async function getFunc() {
    try {
        const res = await pool.query("SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'delete_sale_restore_stock'");
        console.log(res.rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
getFunc();
