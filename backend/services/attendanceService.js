const pool = require('../config/db');

exports.getAllAttendance = async (ownerId) => {
    const { rows } = await pool.query('SELECT * FROM attendance WHERE owner_id = $1', [ownerId]);
    return rows;
};

exports.markAttendanceRecord = async (date, normalizedName, status, finalShakeProfit, ownerId) => {
    const { rows } = await pool.query(
        'INSERT INTO attendance (date, name, status, others_deduction, shake_profit, owner_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', 
        [date, normalizedName, status, 0, finalShakeProfit, ownerId]
    );
    return rows[0].id;
};

exports.deleteAttendanceRecord = async (id, ownerId) => {
    const { rows } = await pool.query('SELECT * FROM attendance WHERE id = $1 AND owner_id = $2', [id, ownerId]);
    const record = rows[0];
    
    if (!record) {
        throw new Error("Record not found");
    }
    
    await pool.query('DELETE FROM attendance WHERE id = $1 AND owner_id = $2', [id, ownerId]);
};
