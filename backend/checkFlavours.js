const db = require('./db');
async function run() {
    try {
        const res = await db.query(`SELECT * FROM flavours`);
        console.log(res.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
