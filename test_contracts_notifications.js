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
    return originalRequire.apply(this, arguments);
};

const oldController = require('./backend/controllers/notificationController');
const newController = require('./backend/features/notifications/notifications.controller');

async function testContracts() {
    console.log("=== CONTRACT COMPARISON ===");

    const reqMock1 = {
        user: { id: 1, email: 'test@example.com', role: 'admin', owner_id: 'owner123' },
        params: { id: 777 },
        body: {}
    };

    const reqMock2 = {
        user: { id: 1, email: 'test@example.com', role: 'admin', owner_id: 'owner123' },
        params: {}, // No ID for "mark all read"
        body: {}
    };

    const runCompare = async (name, operation, mockData, req) => {
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

        await oldController[operation](req, resOld);
        await newController[operation](req, resNew);

        const oldStr = JSON.stringify(oldJson);
        const newStr = JSON.stringify(newJson);
        
        console.log(`\n--- ${name} ---`);
        console.log(`OLD RESPONSE: ${oldStr}`);
        console.log(`NEW RESPONSE: ${newStr}`);
        console.log(`RESULT: ${oldStr === newStr ? 'MATCH' : 'NOT MATCH'}`);
    };

    try {
        await runCompare('GET notifications', 'getNotifications', { rows: [{ id: 1, title: 'Test' }] }, reqMock1);
        await runCompare('GET unread-count', 'getUnreadCount', { rows: [{ count: '5' }] }, reqMock1);
        await runCompare('Mark single read', 'markAsRead', { rows: [] }, reqMock1);
        await runCompare('Mark all read', 'markAsRead', { rows: [] }, reqMock2);
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

testContracts();
