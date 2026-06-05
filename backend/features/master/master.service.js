const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../../db');
const queries = require('./master.queries');
const audit = require('../../shared/services/auditLogService');

const pool = db.pool;

class MasterService {
    // ---------------------------------------------------------
    // MASTER ADMIN PROVISIONING & TIER 1
    // ---------------------------------------------------------
    async getAppStats() {
        const totalAdminsRes = await db.query(queries.getMasterAppStatsAdmins().text);
        const totalUsersRes = await db.query(queries.getMasterAppStatsUsers().text);
        const activeSessionsRes = await db.query(queries.getMasterAppStatsSessions().text);
        return {
            total_admins: parseInt(totalAdminsRes.rows[0].count),
            total_users: parseInt(totalUsersRes.rows[0].count),
            active_users: parseInt(activeSessionsRes.rows[0].count)
        };
    }

    async getLiveSessions() {
        const res = await db.query(queries.getMasterLiveSessions().text);
        return res.rows.map(s => {
            let status = 'Ended';
            if (!s.invalidated_at && new Date(s.expires_at) > new Date()) {
                const ageMins = (Date.now() - new Date(s.last_activity_at).getTime()) / 60000;
                status = ageMins < 5 ? 'Online' : 'Idle';
            }
            return {
                id: s.id, email: s.email, role: s.role, ipAddress: s.ip_address,
                device: s.device_info, loginTime: s.created_at, lastActivity: s.last_activity_at, status
            };
        });
    }

    async getActivityLog() {
        return (await db.query(queries.getMasterActivityLog().text)).rows;
    }

    async getMasterAdmins() {
        return (await db.query(queries.getMasterAdmins().text)).rows;
    }

    async createClubAdmin(email, masterId) {
        const normalizedEmail = email.trim().toLowerCase();
        const exQ = queries.checkMasterEmailExists(normalizedEmail);
        const existCheck = await db.query(exQ.text, exQ.values);
        if (existCheck.rows.length > 0) throw new Error("Email already exists");

        const tempPassword = crypto.randomBytes(8).toString('hex');
        const hash = await bcrypt.hash(tempPassword, 12);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const insQ = queries.createClubAdmin(normalizedEmail, hash, masterId);
            const userRes = await client.query(insQ.text, insQ.values);
            const newUserId = userRes.rows[0].id;
            
            const setQ = queries.setAdminOwnerId(newUserId);
            await client.query(setQ.text, setQ.values);
            
            const confQ = queries.createAdminConfigRecord(newUserId);
            await client.query(confQ.text, confQ.values);

            await client.query('COMMIT');
            await audit.logAction(masterId, 'ADMIN_CREATE', 'users', newUserId);
            
            return tempPassword;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async forceResetAdminPassword(targetId, masterId) {
        const uQ = queries.getUserRoleActiveStatus(targetId);
        const userCheck = await db.query(uQ.text, uQ.values);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role === 'master') {
            throw new Error("User not found or invalid");
        }

        const tempPassword = crypto.randomBytes(8).toString('hex');
        const hash = await bcrypt.hash(tempPassword, 12);

        const updQ = queries.forceResetAdminPassword(hash, targetId);
        await db.query(updQ.text, updQ.values);

        const authService = require('../auth/auth.service');
        await authService.invalidateAllSessions(targetId);

        await audit.logAction(masterId, 'ADMIN_FORCE_RESET', 'users', targetId);
        return tempPassword;
    }

    async toggleAdminStatus(targetId, masterId) {
        const uQ = queries.getUserRoleStatus(targetId);
        const userCheck = await db.query(uQ.text, uQ.values);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role === 'master') {
            throw new Error("User not found or invalid");
        }
        
        const newStatus = !userCheck.rows[0].is_active;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const updQ = queries.toggleAdminStatus(newStatus, targetId);
            await client.query(updQ.text, updQ.values);
            
            if (!newStatus) {
                const invQ = queries.invalidateClubAdminSessions(targetId);
                await client.query(invQ.text, invQ.values);
            }
            
            await client.query('COMMIT');
            await audit.logAction(masterId, newStatus ? 'ADMIN_ACTIVATE' : 'ADMIN_DEACTIVATE', 'users', targetId);
            return newStatus;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateAdminClubNameMaster(clubName, targetId, masterId) {
        const chkQ = queries.checkAdminRoleOnly(targetId);
        const adminCheck = await db.query(chkQ.text, chkQ.values);
        if (adminCheck.rows.length === 0) throw new Error("Admin not found.");

        const updQ = require('../settings/settings.queries').updateAdminClubName(clubName, targetId);
        await db.query(updQ.text, updQ.values);
        
        await audit.logAction(masterId, 'CLUB_NAME_UPDATE_BY_MASTER', 'admin_config', targetId, null, { club_name: clubName });
    }

    async deleteClubAdmin(targetId, masterId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const updQ = queries.deleteClubAdminAndSubordinates(targetId);
            const updateRes = await client.query(updQ.text, updQ.values);
            if (updateRes.rowCount === 0) {
                await client.query('ROLLBACK');
                throw new Error("User not found");
            }
            
            const invQ = queries.invalidateClubAdminSessions(targetId);
            await client.query(invQ.text, invQ.values);

            await client.query('COMMIT');
            await audit.logAction(masterId, 'ADMIN_DELETE', 'users', targetId);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new MasterService();
