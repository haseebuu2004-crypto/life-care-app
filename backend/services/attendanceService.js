const db = require('../config/db');

exports.getAllAttendance = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM attendance', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

exports.markAttendanceRecord = (date, normalizedName, status, finalShakeProfit) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO attendance (date, name, status, others_deduction, shake_profit) VALUES (?, ?, ?, ?, ?)', 
            [date, normalizedName, status, 0, finalShakeProfit], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
};

exports.deleteAttendanceRecord = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM attendance WHERE id = ?', [id], (err, record) => {
            if (err) return reject(err);
            if (!record) return reject(new Error("Record not found"));
            
            db.run('DELETE FROM attendance WHERE id = ?', [id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};
