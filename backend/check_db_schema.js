const db = require('./shared/db/connection');
async function f() {
    try {
        const res = await db.query("SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'products'");
        console.log(res.rows);
    } catch(e) { console.error(e); }
    process.exit();
}
f();
