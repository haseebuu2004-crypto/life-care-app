const db = require('./db');
async function run() {
    try {
        const result = await db.query("SELECT id, owner_id FROM users WHERE email = 'hasieeyy4444@gmail.com'");
        console.log(result.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
