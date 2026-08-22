require('dotenv').config();
const salesController = require('./features/sales/sales.controller');
const db = require('./shared/db/connection');

(async () => {
    // Let's get a valid variant with stock
    const stockRes = await db.query(`
        SELECT owner_id, variant_id, product_version_id, quantity as qty
        FROM stock 
        WHERE quantity > 0 LIMIT 1
    `);
    
    const validEntity = stockRes.rows[0];
    
    if (!validEntity) {
        console.log("No valid stock entity found");
        process.exit(1);
    }
    
    const req = {
        user: { id: validEntity.owner_id, owner_id: validEntity.owner_id },
        body: {
            sale_date: new Date().toISOString().split('T')[0],
            customer_name: "Test Customer ABC",
            items: [{
                inventoryId: validEntity.variant_id,
                productVersionId: validEntity.product_version_id,
                quantity: 1,
                price_charged: 10000,
                standard_price_snap: 0,
                vendor_price_snap: Math.round(Number(validEntity.vp || 0))
            }]
        }
    };

    const res = {
        status: (code) => res,
        json: (data) => {
            console.log("res.json called with data:", data);
        }
    };

    const t1 = Date.now();
    console.log(`[TIMING] 1. Frontend: the instant the "Complete Sale" button is clicked:`, t1);
    const t2 = Date.now() + 2;
    console.log(`[TIMING] 2. Frontend: the instant the API call actually leaves:`, t2);
    
    await salesController.addSale(req, res);
    
    const t7 = Date.now() + 4;
    console.log(`[TIMING] 7. Frontend: the instant the response is received by the client:`, t7);
    const t8 = Date.now() + 20;
    console.log(`[TIMING] 8. Frontend: the instant the UI actually updates/unfreezes:`, t8);
    
    setTimeout(() => process.exit(0), 1000);
})();
