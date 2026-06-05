const Module = require('module');
const originalRequire = Module.prototype.require;

let mockDbData = {};
let mockCustomerData = 1; // mock new customer ID
let mockConfData = {};

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
            query: async (sql, params) => {
                if (sql.includes('SELECT id FROM customers')) return { rows: [] }; // trigger insert
                if (sql.includes('INSERT INTO customers')) return { rows: [{ id: mockCustomerData }] };
                if (sql.includes('SELECT default_shake_amount')) return { rows: [{ default_shake_amount: 1000 }] };
                if (sql.includes('UPDATE attendance')) return { rowCount: mockDbData.rowCount === undefined ? 1 : mockDbData.rowCount };
                if (sql.includes('INSERT INTO attendance')) return { rowCount: mockDbData.rowCount === undefined ? 1 : mockDbData.rowCount, rows: [{id: 99}] };
                return mockDbData;
            } 
        };
    }
    if (path.includes('../services/auditLogService') || path.includes('../../services/auditLogService') || path.includes('../../shared/utils/audit')) {
        return { logAction: async () => {} };
    }
    if (path.includes('../services/cacheService') || path.includes('../../services/cacheService')) {
        return { invalidateCachePattern: async () => {} };
    }
    return originalRequire.apply(this, arguments);
};

const oldController = require('./backend/controllers/attendanceController');
const newController = require('./backend/features/attendance/attendance.controller');
const validation = require('./backend/features/attendance/attendance.validation');

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

        let validationFailed = false;
        if (isPost && operation === 'markAttendance') {
            validation.validateAttendance(req, resNew, () => {});
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

    const baseReq = { user: { id: 1, role: 'admin', email: 'admin@example.com', owner_id: 'owner123' }, params: {}, body: {} };

    try {
        // GET /attendance
        await runCompare('GET /attendance (Success)', 'getAttendance', { rows: [
            { id: 1, attendance_date: '2026-06-05', type: 'default', shake_amount: 1000, name: 'John Doe', customer_id: 1, recorded_by_email: 'admin@example.com' }
        ]}, { ...baseReq });

        // POST /attendance Success (New Customer)
        await runCompare('POST /attendance (Success New Customer)', 'markAttendance', { rowCount: 1 }, { ...baseReq, body: { customerName: 'New Guy', date: '2026-06-05', type: 'default' } }, true);
        
        // POST /attendance Error (Duplicate)
        await runCompare('POST /attendance (Duplicate)', 'markAttendance', { rowCount: 0 }, { ...baseReq, body: { customerId: 1, date: '2026-06-05', type: 'default' } }, true);

        // POST /attendance Error (Validation)
        await runCompare('POST /attendance (Validation)', 'markAttendance', { rowCount: 1 }, { ...baseReq, body: { date: '2026-06-05', type: 'default' } }, true);

        // DELETE /attendance/:id Success
        await runCompare('DELETE /attendance/:id (Success)', 'deleteAttendance', { rowCount: 1 }, { ...baseReq, params: { id: 1 } });
        
        // DELETE /attendance/:id Error (Not found)
        await runCompare('DELETE /attendance/:id (Not Found)', 'deleteAttendance', { rowCount: 0 }, { ...baseReq, params: { id: 99 } });

        // DELETE /attendance/:id Error (User permission)
        const userReq = { user: { id: 2, role: 'user', owner_id: 'owner123' }, params: { id: 1 }, body: {} };
        await runCompare('DELETE /attendance/:id (User Permission Error)', 'deleteAttendance', { rowCount: 0 }, userReq);

    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

testContracts();
