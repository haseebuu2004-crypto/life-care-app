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
    if (path.includes('../services/auditLogService') || path.includes('../../shared/services/auditLogService')) {
        return { logAction: async () => {} };
    }
    return originalRequire.apply(this, arguments);
};

const oldController = require('./backend/controllers/stockController');
const newController = require('./backend/features/stock/stock.controller');
const validation = require('./backend/features/stock/stock.validation');

async function testContracts() {
    console.log("=== CONTRACT COMPARISON ===");

    const runCompare = async (name, operation, mockData, req, isPost = false) => {
        mockDbData = mockData;
        
        let oldJson, newJson, oldStatus = 200, newStatus = 200;
        
        const resOld = {
            status: (s) => { oldStatus = s; return resOld; },
            json: (data) => { oldJson = data; }
        };
        const resNew = {
            status: (s) => { newStatus = s; return resNew; },
            json: (data) => { newJson = data; }
        };

        // For new, run validation first if applicable
        let validationFailed = false;
        if (isPost && operation === 'addStock') {
            validation.validateAddStock(req, resNew, () => {});
            if (newJson) validationFailed = true;
        } else if (isPost && operation === 'updateStockQuantity') {
            validation.validateUpdateStock(req, resNew, () => {});
            if (newJson) validationFailed = true;
        }

        await oldController[operation](req, resOld);
        if (!validationFailed) {
            await newController[operation](req, resNew);
        }

        const oldStr = JSON.stringify(oldJson);
        const newStr = JSON.stringify(newJson);
        
        console.log(`\n--- ${name} ---`);
        console.log(`OLD STATUS: ${oldStatus} | RESPONSE: ${oldStr}`);
        console.log(`NEW STATUS: ${newStatus} | RESPONSE: ${newStr}`);
        console.log(`RESULT: ${oldStr === newStr && oldStatus === newStatus ? 'MATCH' : 'NOT MATCH'}`);
    };

    const baseReq = { user: { id: 1, email: 'test@example.com', owner_id: 'owner123' }, params: {}, body: {} };

    try {
        // GET /stock
        await runCompare('GET /stock (Success)', 'getStock', { rows: [
            { version_id: 1, flavour_id: 2, stock_id: 5, product_id: 1, product_name: 'A', flavor: 'B', vendor_price: 1050, volume_points: 5, qty: 100 }
        ]}, { ...baseReq });

        // POST /stock Success
        await runCompare('POST /stock (Success)', 'addStock', { rows: [{ vendor_price: 100, id: 1 }] }, { ...baseReq, body: { variantId: 1, quantity: 10 } }, true);
        
        // POST /stock Error (Validation)
        await runCompare('POST /stock (Validation Error)', 'addStock', { rows: [] }, { ...baseReq, body: { variantId: 1, quantity: 0 } }, true);

        // POST /stock Error (Not Found)
        await runCompare('POST /stock (Not Found)', 'addStock', { rows: [] }, { ...baseReq, body: { variantId: 99, quantity: 10 } }, true);

        // PATCH /stock/:id Success
        await runCompare('PATCH /stock/:id (Success)', 'updateStockQuantity', { rows: [{ id: 1 }] }, { ...baseReq, params: { id: 1 }, body: { quantity: 5 } }, true);

        // DELETE /stock/:id Success
        await runCompare('DELETE /stock/:id (Success)', 'deleteStock', { rows: [] }, { ...baseReq, params: { id: 1 } });
        
        // Legacy Trap Handlers
        await runCompare('updateStockPrice (Trap)', 'updateStockPrice', { rows: [] }, { ...baseReq });
        await runCompare('increaseStock (Trap)', 'increaseStock', { rows: [] }, { ...baseReq });
        await runCompare('decreaseStock (Trap)', 'decreaseStock', { rows: [] }, { ...baseReq });

    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

testContracts();
