const db = require('../../shared/db/connection');
const audit = require('../../shared/services/auditLogService');
const cache = require('../../shared/services/cacheService');
const queries = require('./attendance.queries');
const customerService = require('../customers/customers.service');

exports.getAttendance = async (ownerId, userRole, userId) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        let result;
        if (userRole === 'user') {
            const query = queries.getAttendanceUser(ownerId, userId);
            result = await db.query(query.text, query.values);
        } else {
            const query = queries.getAttendanceAdmin(ownerId);
            result = await db.query(query.text, query.values);
        }
        
        if (!result || !result.rows) return [];
        if (result.rows.length === 0) return [];
        return result.rows;
    } catch (error) {
        console.error('[AttendanceService] error:', error);
        throw error;
    }
};

exports.markAttendance = async (ownerId, recordedBy, body) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        let { customerId, customerName, date, type, shakeProfit } = body;
        
        if (type === 'default' && shakeProfit === undefined) {
            const confQuery = queries.getConfigShakeAmount(ownerId);
            const conf = await db.query(confQuery.text, confQuery.values);
            shakeProfit = (conf.rows[0]?.default_shake_amount || 0) / 100;
        }

        const shakeAmountPaise = Math.round(Number(shakeProfit || 0) * 100);
        
        const attQuery = queries.upsertAttendanceAtomic(ownerId, customerId, customerName, date, type, shakeAmountPaise, recordedBy);
        
        const t1 = Date.now();
        console.log(`[TIMING] 1. Backend: before mark_attendance_atomic DB call:`, t1);
        
        const attRes = await db.query(attQuery.text, attQuery.values);
        
        const t2 = Date.now();
        console.log(`[TIMING] 2. Backend: after mark_attendance_atomic DB call (${t2 - t1}ms):`, t2);

        if (!attRes || !attRes.rows || attRes.rows.length === 0) {
            throw new Error("Attendance already marked for this member today.");
        }

        const resultData = attRes.rows[0].result;
        const finalAttendanceId = resultData.attendance_id;
        const finalCustomerId = resultData.customer_id;
        const isNewCustomer = resultData.is_new_customer;

        // Fire and forget side-effects so the frontend doesn't wait
        (async () => {
            try {
                if (isNewCustomer && customerName) {
                    await audit.logAction(recordedBy, 'ADD_CUSTOMER', 'customers', finalCustomerId);
                }
                await audit.logAction(recordedBy, 'ATTENDANCE_MARK', 'attendance', finalAttendanceId);
                await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
            } catch (err) {
                console.error('[AttendanceService] Async side-effects error:', err);
            }
        })();
        
        return finalAttendanceId;
    } catch (error) {
        console.error('[AttendanceService] error:', error);
        throw error;
    }
};

exports.deleteAttendance = async (ownerId, userId, userRole, attendanceId) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        let updateQuery;
        
        if (userRole === 'user') {
            updateQuery = queries.deleteAttendanceUser(attendanceId, userId, ownerId);
        } else {
            updateQuery = queries.deleteAttendanceAdmin(attendanceId, ownerId);
        }

        const result = await db.query(updateQuery.text, updateQuery.values);

        if (!result || result.rowCount === 0) {
            if (userRole === 'user') {
                throw new Error("You can only delete attendance you recorded");
            }
            throw new Error("Record not found");
        }

        await audit.logAction(userId, 'ATTENDANCE_DELETE', 'attendance', attendanceId);
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
    } catch (error) {
        console.error('[AttendanceService] error:', error);
        throw error;
    }
};
