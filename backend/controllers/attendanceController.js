const db = require('../db');
const audit = require('../services/auditLogService');
const cache = require('../services/cacheService');

exports.getAttendance = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        
        let result;
        if (req.user.role === 'user') {
            const query = `
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
            `;
            result = await db.query(query, [ownerId, req.user.id]);
        } else {
            const query = `
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
            `;
            result = await db.query(query, [ownerId]);
        }
        
        let formatted = result.rows.map(r => ({
            id: r.id,
            date: r.date || (r.attendance_date ? new Date(r.attendance_date).toISOString().split('T')[0] : ''),
            customer_id: r.customer_id,
            name: r.customer_name || r.name,
            status: r.type, 
            shakeProfit: r.shake_amount / 100,
            recorded_by: r.recorded_by_email || r.recorded_by
        }));
        
        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error("Get Attendance Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.markAttendance = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const recordedBy = req.user.id;
        let { customerId, customerName, date, type, shakeProfit } = req.body;
        
        if (!customerId && customerName) {
            const existing = await db.query(`SELECT id FROM customers WHERE owner_id = $1 AND name ILIKE $2`, [ownerId, customerName.trim()]);
            if (existing.rows.length > 0) {
                customerId = existing.rows[0].id;
            } else {
                const newCust = await db.query(`INSERT INTO customers (owner_id, name) VALUES ($1, $2) RETURNING id`, [ownerId, customerName.trim()]);
                customerId = newCust.rows[0].id;
            }
        }

        if (!customerId) return res.status(400).json({ success: false, message: "Valid customer selection is required." });

        if (type === 'default' && shakeProfit === undefined) {
            const conf = await db.query(`SELECT default_shake_amount FROM admin_config WHERE owner_id = $1`, [ownerId]);
            shakeProfit = (conf.rows[0]?.default_shake_amount || 0) / 100;
        }

        const shakeAmountPaise = Math.round(Number(shakeProfit || 0) * 100);
        
        const attRes = await db.query(`
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
        `, [ownerId, customerId, new Date(date), type, shakeAmountPaise, recordedBy]);

        if (attRes.rowCount === 0) {
            return res.status(400).json({ success: false, message: "Attendance already marked for this member today." });
        }

        await audit.logAction(recordedBy, 'ATTENDANCE_MARK', 'attendance', attRes.rows[0].id);
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
        
        res.json({ success: true, message: 'Attendance logged successfully' });
    } catch (error) {
        console.error("Mark Attendance Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteAttendance = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const userId = req.user.id;
        
        let updateQuery;
        let params;
        
        if (req.user.role === 'user') {
            updateQuery = `
                UPDATE attendance 
                SET is_deleted = true, deleted_at = NOW()
                WHERE id = $1 AND recorded_by = $2 AND owner_id = $3 AND is_deleted = false
            `;
            params = [req.params.id, userId, ownerId];
        } else {
            updateQuery = `
                UPDATE attendance 
                SET is_deleted = true, deleted_at = NOW()
                WHERE id = $1 AND owner_id = $2 AND is_deleted = false
            `;
            params = [req.params.id, ownerId];
        }

        const result = await db.query(updateQuery, params);

        if (result.rowCount === 0) {
            if (req.user.role === 'user') {
                return res.status(403).json({ success: false, message: "You can only delete attendance you recorded" });
            }
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        await audit.logAction(userId, 'ATTENDANCE_DELETE', 'attendance', req.params.id);
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
        
        res.json({ success: true, message: "Attendance deleted" });
    } catch (error) {
        console.error("Delete Attendance Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
