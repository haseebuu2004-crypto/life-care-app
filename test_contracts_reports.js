const Module = require('module');
const originalRequire = Module.prototype.require;

let mockDbData = {};
let mockQueryBehavior = null;
let uploadedFileBuffer = Buffer.from("name,phone\nJohn,1234567890");

Module.prototype.require = function(path) {
    if (path.includes('../migrations/index')) {
        return { query: async () => ({ rows: [] }) };
    }
    if (path.includes('../db') || path.includes('../../shared/db/connection')) {
        const fakeClient = {
            query: async (sql, params) => {
                if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return {};
                if (sql.includes('RETURNING id')) return { rows: [{ id: 1 }] };
                if (mockQueryBehavior) return mockQueryBehavior(sql, params);
                return mockDbData;
            },
            release: () => {}
        };
        return { 
            pool: { connect: async () => fakeClient },
            query: async (sql, params) => {
                if (sql.includes('SELECT club_name FROM admin_config')) return { rows: [{ club_name: 'Test Club' }] };
                if (sql.includes('SELECT COUNT(*) as count FROM customers')) return { rows: [{ count: 10 }] };
                if (sql.includes('SUM(si.price_charged * si.quantity)')) return { rows: [{ rev: 5000, prof: 2000 }] };
                if (sql.includes('SUM(shake_amount)')) return { rows: [{ att_prof: 1000 }] };
                if (mockQueryBehavior) return mockQueryBehavior(sql, params);
                return mockDbData;
            }
        };
    }
    if (path.includes('auditLogService') || path.includes('../../services/auditLogService')) {
        return { logAction: async () => {} };
    }
    if (path === 'puppeteer') {
        return {
            launch: async () => ({
                newPage: async () => ({
                    setContent: async () => {},
                    pdf: async () => Buffer.from('PDF_MOCK')
                }),
                close: async () => {}
            })
        };
    }
    if (path === 'exceljs') {
        return {
            Workbook: class {
                addWorksheet() { return { columns: [], addRows: () => {} }; }
                xlsx = {
                    write: async (res) => { res.send(Buffer.from('EXCEL_MOCK')); },
                    writeBuffer: async () => Buffer.from('EXCEL_MOCK')
                }
            }
        };
    }
    return originalRequire.apply(this, arguments);
};

const oldController = require('./backend/controllers/exportController');
const oldImportController = require('./backend/controllers/importController');
const newController = require('./backend/features/reports/reports.controller');

async function testContracts() {
    console.log("=== REPORTS CONTRACT COMPARISON ===");

    const runCompare = async (name, oldFn, newFn, mockData, req) => {
        mockDbData = mockData;
        
        let oldJson, newJson, oldStatus = 200, newStatus = 200;
        let oldHeaders = {}, newHeaders = {};
        let oldBuffer = null, newBuffer = null;
        
        const resOld = {
            status: (s) => { oldStatus = s; return resOld; },
            json: (data) => { oldJson = data; },
            setHeader: (k, v) => { oldHeaders[k.toLowerCase()] = v; },
            send: (buf) => { oldBuffer = buf; },
            end: () => {}
        };
        const resNew = {
            status: (s) => { newStatus = s; return resNew; },
            json: (data) => { newJson = data; },
            setHeader: (k, v) => { newHeaders[k.toLowerCase()] = v; },
            send: (buf) => { newBuffer = buf; },
            end: () => {}
        };

        try { await oldFn(req, resOld); } catch(e) { oldJson = { err: e.message }; }
        try { await newFn(req, resNew); } catch(e) { newJson = { err: e.message }; }

        const oldStr = JSON.stringify(oldJson || { file: oldBuffer ? oldBuffer.toString() : null });
        const newStr = JSON.stringify(newJson || { file: newBuffer ? newBuffer.toString() : null });
        
        const headerMatch = JSON.stringify(oldHeaders) === JSON.stringify(newHeaders);
        
        console.log(`\n--- ${name} ---`);
        console.log(`OLD STATUS: ${oldStatus} | HEADERS: ${JSON.stringify(oldHeaders)} | RESP: ${oldStr}`);
        console.log(`NEW STATUS: ${newStatus} | HEADERS: ${JSON.stringify(newHeaders)} | RESP: ${newStr}`);
        console.log(`RESULT: ${oldStr === newStr && oldStatus === newStatus && headerMatch ? 'MATCH' : 'NOT MATCH'}`);
    };

    const reqSalesPDF = { user: { id: 'u1', owner_id: 'u1' }, query: { type: 'sales' }, body: {}, params: {} };
    const reqExcel = { user: { id: 'u1', owner_id: 'u1' }, query: { type: 'full_backup' }, body: {}, params: {} };
    const reqImportCust = { user: { id: 'u1', owner_id: 'u1' }, query: {}, body: { type: 'customers' }, params: {}, file: { buffer: Buffer.from("name,phone\nJohn,123\n") } };

    try {
        await runCompare('GET /reports/export?type=sales (PDF)', oldController.exportPDF, newController.exportData, { rows: [] }, reqSalesPDF);
        await runCompare('GET /reports/export?type=full_backup (Excel)', oldController.exportExcel, newController.exportData, { rows: [] }, reqExcel);
        await runCompare('POST /reports/import (Customers)', oldImportController.importCSV, newController.importCSV, { rows: [] }, reqImportCust);

    } catch(e) {
        console.error('ERROR:', e);
    } finally {
        process.exit(0);
    }
}

testContracts();
