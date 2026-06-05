require('dotenv').config();
const db = require('./db');
async function run() {
    try {
        const res = await db.query(`SELECT email FROM users WHERE role = 'admin'`);
        console.log('Admins:', res.rows);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
