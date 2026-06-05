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
                if (sql.includes('SELECT low_stock_threshold, setup_completed, default_shake_amount')) return { rows: [{ setup_completed: true, default_shake_amount: 1500, low_stock_threshold: 10 }] };
                if (sql.includes('totalSalesProfit')) return { rows: [{ totalSalesProfit: 10000, totalSalesRevenue: 15000, totalStockVpValue: 5000, totalShakeProfit: 2000, lowStock: 2 }] };
                if (sql.includes('SELECT s.id, p.name as product_name, s.quantity')) return { rows: [] };
                if (sql.includes('SELECT p.name, SUM(si.quantity) as qty')) return { rows: [] };
                if (sql.includes('SELECT c.name, COALESCE(SUM')) return { rows: [] };
                if (sql.includes('SELECT c.name, COUNT(*) as attendance, AVG(a.shake_amount)')) return { rows: [] };
                if (sql.includes('password_hash')) return { rows: [{ password_hash: '$2a$10$abcdefghijklmnopqrstuv' }] };
                if (mockQueryBehavior) return mockQueryBehavior(sql, params);
                return mockDbData;
            }
        };
    }
    if (path.includes('auditLogService') || path.includes('../../services/auditLogService')) {
        return { logAction: async () => {} };
    }
    if (path.includes('cacheService') || path.includes('../../services/cacheService')) {
        return { 
            getCache: async () => null,
            setCache: async () => {},
            invalidateCachePattern: async () => {} 
        };
    }
    if (path.includes('bcryptjs')) {
        return {
            compareSync: (pw, hash) => pw === 'password'
        };
    }
    return originalRequire.apply(this, arguments);
};

const oldController = require('./backend/controllers/dashboardController');
const newController = require('./backend/features/dashboard/dashboard.controller');

async function testContracts() {
    console.log("=== DASHBOARD CONTRACT COMPARISON ===");

    const runCompare = async (name, operation, mockData, req) => {
        mockDbData = mockData;
        
        let oldJson, newJson, oldStatus = 200, newStatus = 200;
        
        const resOld = {
            status: (s) => { oldStatus = s; return resOld; },
            json: (data) => { oldJson = data; },
            clearCookie: () => {}
        };
        const resNew = {
            status: (s) => { newStatus = s; return resNew; },
            json: (data) => { newJson = data; },
            clearCookie: () => {}
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

    const adminReq = { user: { id: 'u1', role: 'admin', email: 'admin@test.com', owner_id: 'u1' }, query: {}, body: {}, params: {} };
    const userReq = { user: { id: 'u2', role: 'user', email: 'user@test.com', owner_id: 'u1' }, query: {}, body: {}, params: {} };

    try {
        // GET /dashboard/stats
        await runCompare('GET /dashboard/stats', 'getStats', { rows: [] }, { ...adminReq, query: { startDate: '2026-06-01', endDate: '2026-06-30' } });

        // PUT /settings/config
        await runCompare('PUT /settings/config', 'updateAdminConfig', {}, { ...adminReq, body: { default_shake_amount: 15, low_stock_threshold: 5 } });

        // POST /system/reset/request-otp (Success)
        await runCompare('POST /system/reset/request-otp (Success)', 'requestResetOtp', {}, { ...adminReq, body: { password: 'password' } });

        // POST /system/reset/request-otp (Fail - Incorrect password)
        await runCompare('POST /system/reset/request-otp (Fail - Wrong Password)', 'requestResetOtp', {}, { ...adminReq, body: { password: 'wrong' } });

        // POST /system/reset/confirm (Fail - No OTP cache yet since mock resets, we expect Invalid or expired OTP)
        await runCompare('POST /system/reset/confirm (Fail - Expired/Invalid)', 'confirmReset', {}, { ...adminReq, body: { password: 'password', confirmText: 'RESET ALL DATA', otp: '123456' } });

        // DELETE /account (Success)
        await runCompare('DELETE /account (Success)', 'deleteAccount', {}, { ...adminReq });

        // DELETE /account (Fail - User cannot delete primary account)
        await runCompare('DELETE /account (Fail - Not Owner)', 'deleteAccount', {}, { ...userReq });

    } catch(e) {
        console.error('ERROR:', e.message);
    } finally {
        process.exit(0);
    }
}

testContracts();
