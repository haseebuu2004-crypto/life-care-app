const Module = require('module');
const originalRequire = Module.prototype.require;

let oldLog = [];
let newLog = [];

const createMockClient = (logArray) => {
    return {
        query: async (text, params) => {
            logArray.push({ query: text.trim().replace(/\s+/g, ' '), params });
            if (text.includes('SELECT id FROM product_versions')) return { rows: [{ id: 999 }] };
            if (text.includes('INSERT INTO product_versions')) return { rows: [{ id: 1000 }] };
            return { rows: [] };
        },
        release: () => {
            logArray.push({ event: 'release' });
        }
    };
};

Module.prototype.require = function(path) {
    if (path.includes('../migrations/index')) {
        return { query: async () => ({ rows: [] }) };
    }
    if (path.includes('../db') || path.includes('../../shared/db/connection')) {
        const isOld = this.filename.includes('controllers\\productController.js');
        const isNew = this.filename.includes('features\\products\\products.');
        
        const logTarget = isOld ? oldLog : (isNew ? newLog : null);
        
        return {
            pool: { connect: async () => createMockClient(logTarget || newLog) },
            query: async () => ({ rows: [] }) 
        };
    }
    return originalRequire.apply(this, arguments);
};

const oldController = require('./backend/controllers/productController');
const newController = require('./backend/features/products/products.controller');

async function testUpdatePrice() {
    console.log("=== VERSIONING CONTRACT AUDIT ===");

    const reqMock = {
        user: { id: 1, email: 'test@example.com', role: 'admin', owner_id: 'owner123' },
        params: { id: 777 },
        body: { vendor_price: 150.5 }
    };

    const createRes = () => ({
        status: () => createRes(),
        json: () => {}
    });

    const auditMockOld = require('./backend/services/auditLogService');
    const auditMockNew = require('./backend/shared/utils/audit');
    auditMockOld.logAction = async () => oldLog.push({ event: 'audit_log' });
    auditMockNew.logAction = async () => newLog.push({ event: 'audit_log' });

    try {
        await oldController.updateProductPrice(reqMock, createRes());
        await newController.updateProductPrice(reqMock, createRes());
        
        console.log("Legacy operations count:", oldLog.length);
        console.log("Migrated operations count:", newLog.length);
        
        let match = true;
        for (let i = 0; i < Math.max(oldLog.length, newLog.length); i++) {
            const o = JSON.stringify(oldLog[i]);
            const n = JSON.stringify(newLog[i]);
            if (o !== n) {
                console.log(`Mismatch at step ${i}:`);
                console.log(` OLD: ${o}`);
                console.log(` NEW: ${n}`);
                match = false;
            }
        }
        
        if (match) {
            console.log("SUCCESS: Transaction boundaries, query sequence, and parameters are IDENTICAL!");
        }
        
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

testUpdatePrice();
