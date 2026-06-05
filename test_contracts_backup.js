const Module = require('module');
const originalRequire = Module.prototype.require;

let mockDbData = {};
let mockQueryBehavior = null;

Module.prototype.require = function(path) {
    if (path.includes('../migrations/index')) {
        return { query: async () => ({ rows: [] }) };
    }
    if (path.includes('../db') || path.includes('../../shared/db/connection') || path.includes('../config/db')) {
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
            connect: async () => fakeClient,
            query: async (sql, params) => {
                if (sql.includes('SELECT club_name FROM admin_config')) return { rows: [{ club_name: 'Test Club' }] };
                if (sql.includes('SELECT COUNT(*) FROM backup_logs')) return { rows: [{ count: 0 }] };
                if (sql.includes('SELECT * FROM backup_logs')) return { rows: [{ id: 1, file_name: 'b.xlsx' }] };
                if (mockQueryBehavior) return mockQueryBehavior(sql, params);
                return mockDbData;
            }
        };
    }
    if (path.includes('cacheService')) {
        return { invalidateCachePattern: async () => {} };
    }
    if (path === 'googleapis') {
        return {
            google: {
                auth: { OAuth2: class { setCredentials() {} } },
                drive: () => ({
                    files: { create: async () => ({ data: { id: '123', webViewLink: 'http://drive.link' } }) },
                    permissions: { create: async () => {} }
                })
            }
        };
    }
    if (path === 'exceljs' || path === 'xlsx') {
        return {
            Workbook: class {
                addWorksheet() { return { columns: [], addRows: () => {} }; }
                xlsx = {
                    write: async (res) => { res.send(Buffer.from('EXCEL_MOCK')); },
                    writeBuffer: async () => Buffer.from('EXCEL_MOCK')
                }
            },
            utils: {
                book_new: () => ({}),
                json_to_sheet: () => ({}),
                book_append_sheet: () => {},
                sheet_to_json: () => [{ 'owner_id=u1': 'test' }]
            },
            write: () => Buffer.from('XLSX_MOCK'),
            read: () => ({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } })
        };
    }
    return originalRequire.apply(this, arguments);
};

const oldController = require('./backend/controllers/backupController');
const newController = require('./backend/features/backup/backup.controller');

async function testContracts() {
    console.log("=== BACKUP CONTRACT COMPARISON ===");

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
        console.log(`OLD STATUS: ${oldStatus} | RESP: ${oldStr}`);
        console.log(`NEW STATUS: ${newStatus} | RESP: ${newStr}`);
        console.log(`RESULT: ${oldStr === newStr && oldStatus === newStatus ? 'MATCH' : 'NOT MATCH'}`);
    };

    const reqLogs = { user: { id: 'u1', owner_id: 'u1' } };
    const reqGen = { user: { id: 'u1', owner_id: 'u1' }, body: { type: 'sales', format: 'csv', uploadToCloud: false } };
    const reqVal = { user: { id: 'u1', owner_id: 'u1' }, file: { buffer: Buffer.from(""), mimetype: "text/csv", originalname: "a.csv" } };

    try {
        await runCompare('GET /backup/logs', oldController.getBackupLogs, newController.getBackupLogs, { rows: [] }, reqLogs);
        await runCompare('POST /backup/generate (CSV Local)', oldController.generateBackup, newController.generateBackup, { rows: [] }, reqGen);
        await runCompare('POST /backup/restore/validate', oldController.validateRestore, newController.validateRestore, { rows: [] }, reqVal);

    } catch(e) {
        console.error('ERROR:', e);
    } finally {
        process.exit(0);
    }
}

testContracts();
