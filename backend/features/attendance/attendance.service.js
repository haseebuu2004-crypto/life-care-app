const db = require('../../shared/db/connection');
const audit = require('../../shared/services/auditLogService');
const cache = require('../../shared/services/cacheService');
const queries = require('./attendance.queries');
const customerService = require('../customers/customers.service');

exports.getAttendance = async (ownerId, userRole, userId) => {
    let result;
    if (userRole === 'user') {
        const query = queries.getAttendanceUser(ownerId, userId);
        result = await db.query(query.text, query.values);
    } else {
        const query = queries.getAttendanceAdmin(ownerId);
        result = await db.query(query.text, query.values);
    }
    return result;
};

exports.markAttendance = async (ownerId, recordedBy, body) => {
    let { customerId, customerName, date, type, shakeProfit } = body;
    
    if (!customerId && customerName) {
        customerId = await customerService.findOrCreateCustomer(ownerId, customerName, recordedBy);
    }

    if (type === 'default' && shakeProfit === undefined) {
        const confQuery = queries.getConfigShakeAmount(ownerId);
        const conf = await db.query(confQuery.text, confQuery.values);
        shakeProfit = (conf.rows[0]?.default_shake_amount || 0) / 100;
    }

    const shakeAmountPaise = Math.round(Number(shakeProfit || 0) * 100);
    
    const attQuery = queries.upsertAttendance(ownerId, customerId, date, type, shakeAmountPaise, recordedBy);
    const attRes = await db.query(attQuery.text, attQuery.values);

    if (attRes.rowCount === 0) {
        throw new Error("Attendance already marked for this member today.");
    }

    await audit.logAction(recordedBy, 'ATTENDANCE_MARK', 'attendance', attRes.rows[0].id);
    await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
    
    return attRes.rows[0].id;
};

exports.deleteAttendance = async (ownerId, userId, userRole, attendanceId) => {
    let updateQuery;
    
    if (userRole === 'user') {
        updateQuery = queries.deleteAttendanceUser(attendanceId, userId, ownerId);
    } else {
        updateQuery = queries.deleteAttendanceAdmin(attendanceId, ownerId);
    }

    const result = await db.query(updateQuery.text, updateQuery.values);

    if (result.rowCount === 0) {
        if (userRole === 'user') {
            throw new Error("You can only delete attendance you recorded");
        }
        throw new Error("Record not found");
    }

    await audit.logAction(userId, 'ATTENDANCE_DELETE', 'attendance', attendanceId);
    await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
};
