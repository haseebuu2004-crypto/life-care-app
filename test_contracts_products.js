const Module = require('module');
const originalRequire = Module.prototype.require;

let mockDbData = {};

Module.prototype.require = function(path) {
    if (path.includes('../migrations/index')) {
        return { query: async () => ({ rows: [] }) };
    }
    if (path.includes('../db') || path.includes('../../shared/db/connection')) {
        const fakeClient = {
            query: async (sql, params) => mockDbData,
            release: () => {}
        };
        return { 
            pool: { connect: async () => fakeClient },
            query: async (sql, params) => mockDbData 
        };
    }
    if (path.includes('auditLogService') || path.includes('../../shared/utils/audit')) {
        return { logAction: async () => {} };
    }
    return originalRequire.apply(this, arguments);
};

const oldController = require('./backend/controllers/productController');
const newController = require('./backend/features/products/products.controller');

async function testContracts() {
    console.log("=== CONTRACT COMPARISON ===");

    const reqMock = {
        user: { id: 1, email: 'test@example.com', role: 'admin', owner_id: 'owner123' },
        params: { id: 777 },
        body: { name: 'Test Product', vendor_price: 150, vp: 5, product_id: 123 }
    };

    const runCompare = async (name, operation, mockData) => {
        mockDbData = mockData;
        
        let oldJson, newJson;
        const resOld = {
            status: () => resOld,
            json: (data) => { oldJson = data; }
        };
        const resNew = {
            status: () => resNew,
            json: (data) => { newJson = data; }
        };

        await oldController[operation](reqMock, resOld);
        await newController[operation](reqMock, resNew);

        const oldStr = JSON.stringify(oldJson);
        const newStr = JSON.stringify(newJson);
        
        console.log(`\n--- ${name} ---`);
        console.log(`OLD RESPONSE: ${oldStr}`);
        console.log(`NEW RESPONSE: ${newStr}`);
        console.log(`RESULT: ${oldStr === newStr ? 'MATCH' : 'NOT MATCH'}`);
    };

    try {
        await runCompare('GET products', 'getProducts', { rows: [{ product_id: 1, product_name: 'ProdA', version_id: 2, vendor_price: 10000, volume_points: 10, version_is_active: true }] });
        await runCompare('POST product', 'addProduct', { rows: [{ id: 999 }] });
        await runCompare('Update product price', 'updateProductPrice', { rows: [{ id: 888 }] });
        await runCompare('Add flavour', 'addFlavour', { rows: [{ id: 777 }] });
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

testContracts();
