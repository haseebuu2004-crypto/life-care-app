require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();

    try {
        await client.query(`ALTER TABLE "product_variants" DROP CONSTRAINT IF EXISTS "unique_product_flavor_owner";`);
        console.log("Successfully dropped constraint 'unique_product_flavor_owner'.");
    } catch (e) {
        console.error("Error dropping constraint:", e.message);
    }

    await client.end();
}
main();
