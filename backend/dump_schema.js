const db = require('./shared/db/connection');

async function testSchema() {
    const r = await db.query("SELECT * FROM products WHERE name LIKE 'Test Variant%';");
    console.log("products", r.rows);
    const r2 = await db.query("SELECT * FROM product_versions WHERE product_id IN (SELECT id FROM products WHERE name LIKE 'Test Variant%');");
    console.log("product_versions", r2.rows);
    const r3 = await db.query("SELECT * FROM variants WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id IN (SELECT id FROM products WHERE name LIKE 'Test Variant%'));");
    console.log("variants", r3.rows);
    process.exit();
}

testSchema();
