const Module = require('module');
const originalRequire = Module.prototype.require;

let mockDbData = {};
let mockQueryBehavior = null;

Module.prototype.require = function(path) {
    if (path.includes('../migrations/index')) {
        return { query: async () => ({ rows: [] }) };
    }
    if (path.includes('../db') || path.includes('../../shared/db/connection')) {
        const fakeClient = {
            query: async (sql, params) => {
                if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return {};
                if (mockQueryBehavior) return mockQueryBehavior(sql, params);
                return mockDbData;
            },
            release: () => {}
        };
        return { 
            pool: { connect: async () => fakeClient },
            query: async (sql, params) => {
                if (sql.includes('SELECT id FROM customers')) return { rows: [] };
                if (sql.includes('INSERT INTO customers')) return { rows: [{ id: 'cust-1' }] };
                if (sql.includes('create_sale_atomic')) return { rows: [{ sale_id: 'sale-1' }] };
                if (sql.includes('delete_sale_restore_stock')) return { rows: [{ success: true }] };
                if (sql.includes('admin_config')) return { rows: [{ low_stock_threshold: 10, discount_alert_pct: 30 }] };
                if (sql.includes('SELECT email FROM users')) return { rows: [{ email: 'staff@test.com' }] };
                if (sql.includes('SELECT name FROM customers')) return { rows: [{ name: 'Test Customer' }] };
                if (sql.includes('SELECT quantity FROM stock')) return { rows: [{ quantity: 50 }] };
                if (sql.includes('SELECT p.name FROM products')) return { rows: [{ name: 'Test Product' }] };
                if (sql.includes('SELECT recorded_by FROM sales')) return mockDbData;
                if (mockQueryBehavior) return mockQueryBehavior(sql, params);
                return mockDbData;
            }
        };
    }
    if (path.includes('auditLogService') || path.includes('../../shared/utils/audit')) {
        return { logAction: async () => {} };
    }
    if (path.includes('cacheService')) {
        return { invalidateCachePattern: async () => {} };
    }
    if (path.includes('notificationService')) {
        return { createNotification: async () => {} };
    }
    return originalRequire.apply(this, arguments);
};

const oldController = require('./backend/controllers/salesController');
const newController = require('./backend/features/sales/sales.controller');

async function testContracts() {
    console.log("=== SALES CONTRACT COMPARISON ===");

    const runCompare = async (name, operation, mockData, req) => {
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

        await oldController[operation](req, resOld);
        await newController[operation](req, resNew);

        const oldStr = JSON.stringify(oldJson);
        const newStr = JSON.stringify(newJson);
        
        console.log(`\n--- ${name} ---`);
        console.log(`OLD STATUS: ${oldStatus} | RESPONSE: ${oldStr}`);
        console.log(`NEW STATUS: ${newStatus} | RESPONSE: ${newStr}`);
        console.log(`RESULT: ${oldStr === newStr && oldStatus === newStatus ? 'MATCH' : 'NOT MATCH'}`);
    };

    const adminReq = { user: { id: 'u1', role: 'admin', email: 'admin@test.com', owner_id: 'o1' }, params: {}, body: {} };
    const userReq = { user: { id: 'u2', role: 'user', email: 'user@test.com', owner_id: 'o1' }, params: {}, body: {} };

    try {
        // GET /sales (admin)
        await runCompare('GET /sales (Admin)', 'getSales', { rows: [] }, { ...adminReq });
        
        // GET /sales (user — no sales)
        await runCompare('GET /sales (User Empty)', 'getSales', { rows: [] }, { ...userReq });

        // POST /sales (Success)
        await runCompare('POST /sales (Success)', 'addSale', {}, { ...adminReq, body: { customer_id: 'c1', sale_date: '2026-06-05', items: [{ product_version_id: 'pv1', quantity: 1, price_charged: 1000, standard_price_snap: 1000, vendor_price_snap: 500 }] } });

        // POST /sales (No Customer Error)
        await runCompare('POST /sales (No Customer)', 'addSale', {}, { ...adminReq, body: { sale_date: '2026-06-05', items: [{ product_version_id: 'pv1', quantity: 1, price_charged: 1000, standard_price_snap: 1000, vendor_price_snap: 500 }] } });

        // POST /sales (No Items Error)
        await runCompare('POST /sales (No Items)', 'addSale', {}, { ...adminReq, body: { customer_id: 'c1', sale_date: '2026-06-05', items: [] } });

        // DELETE /sales/:id (Admin Success)
        await runCompare('DELETE /sales/:id (Admin Success)', 'deleteSale', { rows: [{ success: true }] }, { ...adminReq, params: { id: 's1' } });

        // DELETE /sales/:id (User No Permission)
        await runCompare('DELETE /sales/:id (User No Permission)', 'deleteSale', { rows: [{ recorded_by: 'other-user' }] }, { ...userReq, params: { id: 's1' } });

        // DELETE /sales/:id (Not Found)
        await runCompare('DELETE /sales/:id (Not Found)', 'deleteSale', { rows: [] }, { ...userReq, params: { id: 's1' } });

    } catch(e) {
        console.error('ERROR:', e.message);
    } finally {
        process.exit(0);
    }
}

testContracts();
