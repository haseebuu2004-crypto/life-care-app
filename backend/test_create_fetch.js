const db = require('./shared/db/connection');
const productsService = require('./features/products/products.service');
const inventoryQueries = require('./features/inventory/inventory.queries');

async function testCreateFetch() {
    const client = await db.pool.connect();
    try {
        const ownerRes = await client.query('SELECT id FROM users LIMIT 1');
        const ownerId = ownerRes.rows[0].id;
        const productName = 'Test Variant Entity ' + Date.now();

        console.log(`1. Creating product '${productName}'...`);
        await productsService.addProduct(ownerId, ownerId, {
            name: productName,
            vendor_price: 100,
            volume_points: 5,
            flavor: 'Strawberry, Apple'
        });
        
        console.log("Created successfully.");

        console.log("2. Fetching immediately via inventoryEntities...");
        const fetchRes = await inventoryQueries.getInventoryEntities(ownerId);
        
        const found = fetchRes.rows.filter(r => r.product_name.includes(productName));
        console.log(`Found ${found.length} rows.`);
        console.log("Found rows:", found.map(r => ({ name: r.product_name, variant: r.variant_name })));

        console.log("3. Fetching from raw tables...");
        const pRes = await client.query("SELECT * FROM products WHERE name = $1", [productName]);
        console.log("products:", pRes.rows);
        
        const pvRes = await client.query("SELECT * FROM product_versions WHERE product_id = $1", [pRes.rows[0].id]);
        console.log("product_versions:", pvRes.rows);
        
        const vRes = await client.query("SELECT * FROM variants WHERE product_version_id = $1", [pvRes.rows[0].id]);
        console.log("variants:", vRes.rows);
        
    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        process.exit();
    }
}

testCreateFetch();
