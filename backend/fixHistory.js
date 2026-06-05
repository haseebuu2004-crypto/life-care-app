require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();

    try {
        await client.query(`
            UPDATE login_history lh
            SET username = u.username, role = u.role, device = 'Desktop', browser = 'Chrome'
            FROM users u
            WHERE lh.user_id = u.id AND (lh.username IS NULL OR lh.username = '');
        `);
        console.log("Successfully backfilled login_history!");
    } catch (e) {
        console.error("Error backfilling:", e.message);
    }

    await client.end();
}
main();
