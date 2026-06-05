const oldController = require('./backend/controllers/productController');
const newController = require('./backend/features/products/products.controller');

async function testContracts() {
    console.log("=== CONTRACT COMPARISON ===");

    const reqMock = {
        user: { id: 1, email: 'test@example.com', role: 'admin', owner_id: 'owner123' },
        params: { id: 777 },
        body: { name: 'Test', vendor_price: 150, vp: 5 }
    };

    let oldStatus, oldJson;
    const resOld = {
        status: (code) => { oldStatus = code; return resOld; },
        json: (data) => { oldJson = data; }
    };

    let newStatus, newJson;
    const resNew = {
        status: (code) => { newStatus = code; return resNew; },
        json: (data) => { newJson = data; }
    };

    try {
        // We override dbOld and dbNew to just return fake data so we can compare the json shape
        const Module = require('module');
        const originalRequire = Module.prototype.require;
        Module.prototype.require = function(path) {
            if (path.includes('../db') || path.includes('../../shared/db/connection')) {
                return { 
                    pool: { connect: async () => ({
                        query: async () => ({ rows: [{id: 1}] }),
                        release: () => {}
                    })},
                    query: async () => ({ rows: [{id: 1, product_id: 1, name: 'T', vendor_price: 100, is_active: true}] }) 
                };
            }
            if (path.includes('../migrations/index')) {
                return { query: async () => ({ rows: [] }) };
            }
            return originalRequire.apply(this, arguments);
        };
        
        // Reload controllers with mock
        const oldC = require('./backend/controllers/productController');
        const newC = require('./backend/features/products/products.controller');

        oldStatus = 200; newStatus = 200;
        await oldC.getProducts(reqMock, resOld);
        await newC.getProducts(reqMock, resNew);
        console.log(`getProducts - Old: ${oldStatus}, New: ${newStatus}`);
        console.log(JSON.stringify(oldJson) === JSON.stringify(newJson) ? "GET Match!" : "Mismatch!");

        oldStatus = 200; newStatus = 200;
        await oldC.toggleProductStatus(reqMock, resOld);
        await newC.toggleProductStatus(reqMock, resNew);
        console.log(`toggleProductStatus - Old: ${oldStatus}, New: ${newStatus}`);
        console.log(JSON.stringify(oldJson) === JSON.stringify(newJson) ? "TOGGLE Match!" : "Mismatch!");
        
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

testContracts();
