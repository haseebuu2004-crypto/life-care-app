const db = require('./shared/db/connection');
const productsService = require('./features/products/products.service');
const inventoryQueries = require('./features/inventory/inventory.queries');
const stockService = require('./features/stock/stock.service');

async function testStock() {
    const client = await db.pool.connect();
    try {
        const ownerRes = await client.query('SELECT id FROM users LIMIT 1');
        const ownerId = ownerRes.rows[0].id;
        const productName = 'Stock Variant Test ' + Date.now();

        console.log(`1. Creating product '${productName}'...`);
        await productsService.addProduct(ownerId, ownerId, {
            name: productName,
            vendor_price: 150,
            volume_points: 10,
            flavor: 'Paan'
        });
        
        console.log("2. Fetching inventory entities...");
        const fetchRes = await inventoryQueries.getInventoryEntities(ownerId);
        
        const found = fetchRes.rows.filter(r => r.product_name.includes(productName));
        if (found.length === 0) {
            console.error("Product not found in inventory!");
            return;
        }

        const variantId = found[0].variant_id;
        console.log(`Found variant_id: ${variantId}`);

        console.log("3. Adding stock...");
        await stockService.addStock(ownerId, variantId, 10, ownerId);
        console.log("Stock added successfully!");

        console.log("4. Verifying stock row...");
        const stockRes = await client.query('SELECT * FROM stock WHERE variant_id = $1', [variantId]);
        console.log(stockRes.rows);

    } catch (e) {
        console.error("Test failed:", e);
    } finally {
        client.release();
        process.exit();
    }
}

testStock();
