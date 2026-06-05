const db = require('./db');
async function run() {
    try {
        const res = await db.query(`SELECT pg_get_functiondef('create_sale_atomic'::regproc)`);
        console.log(res.rows[0].pg_get_functiondef);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
