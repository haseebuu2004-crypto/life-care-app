const db = require('../config/db');

exports.getAllAttendance = (ownerId) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM attendance WHERE owner_id = ?', [ownerId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

exports.markAttendanceRecord = (date, normalizedName, status, finalShakeProfit, ownerId) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO attendance (date, name, status, others_deduction, shake_profit, owner_id) VALUES (?, ?, ?, ?, ?, ?)', 
            [date, normalizedName, status, 0, finalShakeProfit, ownerId], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
};

exports.deleteAttendanceRecord = (id, ownerId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM attendance WHERE id = ? AND owner_id = ?', [id, ownerId], (err, record) => {
            if (err) return reject(err);
            if (!record) return reject(new Error("Record not found"));
            
            db.run('DELETE FROM attendance WHERE id = ? AND owner_id = ?', [id, ownerId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};
