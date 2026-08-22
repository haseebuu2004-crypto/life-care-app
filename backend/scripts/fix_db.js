require('dotenv').config();
const pool = require('./shared/db/connection');

async function test() {
    await pool.query(`UPDATE stock SET quantity = quantity + 5 WHERE variant_id IN ('f167f3d7-2541-4d60-bb72-45da3370866c', '67433ea4-3fc2-4928-b4d6-c7ba3d8e3237')`);
    console.log('Stock fixed.');
    process.exit(0);
}
test();
