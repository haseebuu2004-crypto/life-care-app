const db = require('./db');
const owner = '3ab51607-4452-4941-8f3a-82de44b18ae9';
async function run() {
    try {
        const result = await db.query('SELECT * FROM stock WHERE owner_id = $1', [owner]);
        console.log(result.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
