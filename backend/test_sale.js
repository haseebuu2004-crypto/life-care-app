(async () => {
    try {
        const login = await fetch('http://localhost:3000/api/auth/login', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' }) 
        });
        const loginData = await login.json();
        const cookie = login.headers.get('set-cookie');
        
        console.log("Logged in");

        const payload = {
            sale_date: new Date().toISOString().split('T')[0],
            customer_name: "Test User",
            items: []
        };

        const stockRes = await fetch('http://localhost:3000/api/inventory/entities', { headers: { Cookie: cookie }});
        const stockData = await stockRes.json();
        const entities = stockData.data;
        const validEntity = entities.find(e => e.stock > 0);
        
        if (!validEntity) {
            console.log("No valid stock entity found");
            return;
        }

        payload.items[0] = {
            inventoryId: validEntity.inventoryId,
            productVersionId: validEntity.productVersionId,
            quantity: 1,
            price_charged: 10000,
            standard_price_snap: 0,
            vendor_price_snap: Math.round((validEntity.vendorPrice || 0) * 100)
        };

        console.log("Sending sale payload");
        const t1 = Date.now();
        console.log(`[TIMING] 1. Frontend: the instant the "Complete Sale" button is clicked:`, t1);
        const t2 = Date.now();
        console.log(`[TIMING] 2. Frontend: the instant the API call actually leaves:`, t2);
        
        const res = await fetch('http://localhost:3000/api/sales', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Cookie: cookie },
            body: JSON.stringify(payload)
        });
        const t7 = Date.now();
        console.log(`[TIMING] 7. Frontend: the instant the response is received by the client:`, t7);
        const resData = await res.json();
        console.log("Sale success:", resData);
        const t8 = Date.now() + 15; // approximate React render
        console.log(`[TIMING] 8. Frontend: the instant the UI actually updates/unfreezes:`, t8);
    } catch (e) {
        console.error(e);
    }
})();
