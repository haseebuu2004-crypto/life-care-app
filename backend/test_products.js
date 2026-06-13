require('dotenv').config();
const db = require('./shared/db/connection');
const productsService = require('./features/products/products.service');

async function test() {
    try {
        console.log("Testing updateProductPrice...");
        const ownerRes = await db.query('SELECT owner_id, id FROM products LIMIT 1');
        if (ownerRes.rows.length > 0) {
            const ownerId = ownerRes.rows[0].owner_id;
            const productId = ownerRes.rows[0].id;
            console.log("Found owner:", ownerId, "product:", productId);
            
            // Dummy user ID (can just use owner_id for test if user table not joined strictly)
            await productsService.updateProductPrice(productId, ownerId, ownerId, {
                vendor_price: 15.50,
                version_label: "v2_test_" + Date.now()
            });
            console.log("updateProductPrice executed successfully.");

            const products = await productsService.getProducts(ownerId);
            console.log("Products Service Output after update:");
            console.log(JSON.stringify(products, null, 2));

        } else {
            console.log("No data found in DB to test.");
        }
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
test();
