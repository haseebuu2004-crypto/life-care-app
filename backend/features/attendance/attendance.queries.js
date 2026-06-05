exports.getAttendanceUser = (ownerId, userId) => {
    return {
        text: `
            SELECT 
                a.id, 
                TO_CHAR(a.attendance_date, 'YYYY-MM-DD') as date, 
                a.type, 
                a.shake_amount, 
                c.name as customer_name,
                c.id as customer_id,
                u.email as recorded_by_email 
            FROM attendance a
            JOIN customers c ON a.customer_id = c.id
            JOIN users u ON a.recorded_by = u.id
            WHERE a.owner_id = $1
            AND a.recorded_by = $2
            AND a.is_deleted = false
            ORDER BY a.attendance_date DESC
        `,
        values: [ownerId, userId]
    };
};

exports.getAttendanceAdmin = (ownerId) => {
    return {
        text: `
            SELECT 
                a.id, 
                TO_CHAR(a.attendance_date, 'YYYY-MM-DD') as date, 
                a.type, 
                a.shake_amount, 
                c.name, 
                c.id as customer_id, 
                u.email as recorded_by_email 
            FROM attendance a
            JOIN customers c ON a.customer_id = c.id
            JOIN users u ON a.recorded_by = u.id
            WHERE a.owner_id = $1 AND a.is_deleted = false
            ORDER BY a.attendance_date DESC
        `,
        values: [ownerId]
    };
};

exports.getConfigShakeAmount = (ownerId) => {
    return {
        text: `SELECT default_shake_amount FROM admin_config WHERE owner_id = $1`,
        values: [ownerId]
    };
};

exports.upsertAttendance = (ownerId, customerId, date, type, shakeAmountPaise, recordedBy) => {
    return {
        text: `
            INSERT INTO attendance (owner_id, customer_id, attendance_date, type, shake_amount, recorded_by, is_deleted)
            VALUES ($1, $2, $3, $4, $5, $6, false)
            ON CONFLICT (owner_id, customer_id, attendance_date) DO UPDATE 
            SET 
                is_deleted = false,
                type = EXCLUDED.type,
                shake_amount = EXCLUDED.shake_amount,
                recorded_by = EXCLUDED.recorded_by,
                deleted_at = null
            WHERE attendance.is_deleted = true
            RETURNING id
        `,
        values: [ownerId, customerId, new Date(date), type, shakeAmountPaise, recordedBy]
    };
};

exports.deleteAttendanceUser = (attendanceId, userId, ownerId) => {
    return {
        text: `
            UPDATE attendance 
            SET is_deleted = true, deleted_at = NOW()
            WHERE id = $1 AND recorded_by = $2 AND owner_id = $3 AND is_deleted = false
        `,
        values: [attendanceId, userId, ownerId]
    };
};

exports.deleteAttendanceAdmin = (attendanceId, ownerId) => {
    return {
        text: `
            UPDATE attendance 
            SET is_deleted = true, deleted_at = NOW()
            WHERE id = $1 AND owner_id = $2 AND is_deleted = false
        `,
        values: [attendanceId, ownerId]
    };
};
