require('dotenv').config();
const db = require('./shared/db/connection');

async function f() {
    try {
        const r = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='settings'");
        console.log('settings columns:', r.rows);
        const r2 = await db.query("SELECT * FROM settings");
        console.log('settings rows:', r2.rows);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
f();
