const { readDB, writeDB } = require('../data/dbHelper');
const { v4: uuidv4 } = require('uuid');

function getUsage() {
    const db = readDB();
    const trackers = db.personal_tracking || [];
    return trackers.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function updateUsage(id, col, val) {
    const db = readDB();
    if (!db.personal_tracking) db.personal_tracking = [];
    const index = db.personal_tracking.findIndex(r => r.id === id);
    
    if (index !== -1) {
        let finalVal = val;
        if (['f1','pp','afresh','others','sp'].includes(col)) {
            finalVal = parseFloat(val);
            if (isNaN(finalVal)) finalVal = 0;
        }
        db.personal_tracking[index][col] = finalVal;
        writeDB(db);
        return db.personal_tracking[index];
    }
    throw new Error("Usage record not found");
}

function deleteUsage(id) {
    const db = readDB();
    if (!db.personal_tracking) db.personal_tracking = [];
    db.personal_tracking = db.personal_tracking.filter(r => r.id !== id);
    writeDB(db);
    return getUsage();
}

module.exports = { getUsage, updateUsage, deleteUsage };
