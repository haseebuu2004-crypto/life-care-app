const db = require('./db');
async function run() {
    try {
        const res = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'stock'`);
        console.log(res.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
