const { readDB, writeDB } = require('../data/dbHelper');
const { v4: uuidv4 } = require('uuid');

function getAttendance() {
    const db = readDB();
    const atts = db.attendance || [];
    return atts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function addAttendance(date, name, status) {
    const db = readDB();
    const rNameTrimmed = (name || '').trim();
    
    let warn = false;
    let f1 = 0, pp = 0, afresh = 0, others = 0, sp = 0, ext1 = '', ext2 = '';

    // "Name normalization (case-insensitive)"
    const normalizedName = rNameTrimmed.toLowerCase();

    if (!db.personal_tracking) db.personal_tracking = [];
    
    // Find the last record for this user (case-insensitive)
    // Sort all records descending to get the 'last' logically by date
    const userRecords = db.personal_tracking
        .filter(r => (r.personName || '').trim().toLowerCase() === normalizedName)
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    const lastRec = userRecords.length > 0 ? userRecords[0] : null;

    if (lastRec) {
        f1 = lastRec.f1; pp = lastRec.pp; afresh = lastRec.afresh;
        others = lastRec.others; sp = lastRec.sp; ext1 = lastRec.extra1; ext2 = lastRec.extra2;
    }

    if (status.includes('Present')) {
        if (f1 < 3 || pp < 1 || afresh < 2 || others < 30) {
            warn = true;
        }
        f1 = Math.max(0, f1 - 3);
        pp = Math.max(0, pp - 1);
        afresh = Math.max(0, afresh - 2);
        others = Math.max(0, others - 30);
    }

    const newAtt = {
        id: uuidv4(),
        date,
        name: rNameTrimmed,
        status,
        createdAt: new Date().toISOString()
    };

    const newTrack = {
        id: uuidv4(),
        personName: rNameTrimmed,
        date,
        f1, pp, afresh, others, sp,
        extra1: ext1, extra2: ext2,
        createdAt: new Date().toISOString()
    };

    if (!db.attendance) db.attendance = [];
    db.attendance.push(newAtt);
    
    // Always append tracking data when attendance is added logically
    db.personal_tracking.push(newTrack);

    writeDB(db);

    return { newAtt, warn };
}

function deleteAttendance(id) {
    const db = readDB();
    if (!db.attendance) return [];
    db.attendance = db.attendance.filter(a => a.id !== id);
    writeDB(db);
    return getAttendance();
}

module.exports = { getAttendance, addAttendance, deleteAttendance };
