require('dotenv').config();
const db = require('./db');

async function main() {
    try {
        await db.query(
            "UPDATE users SET email = $1 WHERE id = $2",
            ['hasieeyy444@gmail.com', '59ce3b1c-3618-4579-ba4a-afde93eec30e']
        );
        console.log('User restored successfully.');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

main();
