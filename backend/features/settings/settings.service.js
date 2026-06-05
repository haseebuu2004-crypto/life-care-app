const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../../db');
const queries = require('./settings.queries');
const audit = require('../../shared/services/auditLogService');
const authService = require('../auth/auth.service');
const notificationService = require('../notifications/notifications.service');

// We use pool directly for transactions where necessary
const pool = db.pool;

class SettingsService {


    // ---------------------------------------------------------
    // STANDARD USER MANAGEMENT
    // ---------------------------------------------------------
    async getUsers(ownerId) {
        const q = queries.getUsers(ownerId);
        return (await db.query(q.text, q.values)).rows;
    }

    async createUser(username, password, email, role, adminUserId, adminOwnerId) {
        const targetRole = role || 'user';
        let tempPassword = null;
        
        if (!password) {
            tempPassword = crypto.randomBytes(4).toString('hex');
            password = tempPassword;
        }

        if (targetRole === 'user') {
            const countQ = queries.countStandardUsers(adminOwnerId);
            const countRes = await db.query(countQ.text, countQ.values);
            if (parseInt(countRes.rows[0].count) >= 2) {
                throw new Error("You can only add 2 staff users.");
            }
        }

        if (!username && email) {
            username = email.split('@')[0];
        } else if (!username && !email) {
            throw new Error("Email or username is required");
        }

        const userEmail = email ? email.trim().toLowerCase() : `${username.replace(/\s+/g, '').toLowerCase()}@clubapp.local`;
        
        const exQ = queries.checkEmailExists(userEmail);
        const existing = await db.query(exQ.text, exQ.values);
        
        if (existing.rows.length > 0) {
            if (existing.rows[0].is_active) {
                throw new Error("Email already registered");
            } else {
                if (existing.rows[0].owner_id !== adminOwnerId) {
                    throw new Error("Email is already registered in another club");
                }
                const hash = await bcrypt.hash(password, 12);
                const rQ = queries.reactivateUser(hash, targetRole, existing.rows[0].id);
                const updateRes = await db.query(rQ.text, rQ.values);
                await audit.logAction(adminUserId, 'USER_REACTIVATE', 'users', updateRes.rows[0].id);
                return { tempPassword, user: updateRes.rows[0] };
            }
        }

        const hash = await bcrypt.hash(password, 12);
        const insQ = queries.createUser(userEmail, hash, targetRole, adminOwnerId, adminUserId);
        const newRes = await db.query(insQ.text, insQ.values);
        await audit.logAction(adminUserId, 'USER_CREATE', 'users', newRes.rows[0].id);
        
        return { tempPassword, user: newRes.rows[0] };
    }

    async updateUserRole(role, targetId, ownerId) {
        const q = queries.updateUserRole(role, targetId, ownerId);
        const updRes = await db.query(q.text, q.values);
        if (updRes.rowCount === 0) throw new Error("User not found");
    }

    async deleteUser(targetId, adminUserId, ownerId) {
        const q = queries.deleteUser(targetId, ownerId);
        const delRes = await db.query(q.text, q.values);
        if (delRes.rowCount === 0) throw new Error("User not found");
        
        await authService.invalidateAllSessions(targetId);
        await audit.logAction(adminUserId, 'USER_DELETE', 'users', targetId);
    }

    async adminUpdateUserPassword(newPassword, targetId, adminUserId, ownerId) {
        if (!newPassword || newPassword.length < 8) throw new Error("Password must be at least 8 characters.");
        const hash = await bcrypt.hash(newPassword, 12);
        
        const updQ = queries.adminUpdateUserPassword(hash, targetId, ownerId);
        const result = await db.query(updQ.text, updQ.values);
        if (result.rowCount === 0) throw new Error("User not found or you don't have permission");
        
        await authService.invalidateAllSessions(targetId);
        await audit.logAction(adminUserId, 'USER_FORCE_PWD_CHANGE', 'users', targetId);
    }

    async getLoginHistory(ownerId) {
        const q = queries.getLoginHistory(ownerId);
        const result = await db.query(q.text, q.values);
        
        return result.rows.map(r => {
            const ageMins = (Date.now() - new Date(r.created_at).getTime()) / 60000;
            let status = 'Ended';
            if (!r.invalidated_at && new Date(r.expires_at) > new Date()) {
                status = ageMins < 15 ? 'Online' : 'Idle';
            }
            return { ipAddress: r.ip_address, userAgent: r.device_info, loginTime: r.created_at, userEmail: r.user_email, status };
        });
    }

    // ---------------------------------------------------------
    // DASHBOARD & CONFIGURATION SETTINGS
    // ---------------------------------------------------------
    async getAdminClubName(ownerId) {
        const q = queries.getAdminClubName(ownerId);
        const result = await db.query(q.text, q.values);
        return result.rows.length > 0 ? result.rows[0].club_name : null;
    }

    async updateAdminClubName(clubName, adminUserId, ownerId) {
        const q = queries.updateAdminClubName(clubName, ownerId);
        await db.query(q.text, q.values);
        await audit.logAction(adminUserId, 'CLUB_NAME_UPDATE', 'admin_config', ownerId, null, { club_name: clubName });
    }

    async getUserClubName(ownerId) {
        const q = queries.getUserClubName(ownerId);
        const result = await db.query(q.text, q.values);
        if (result.rows.length > 0) {
            const { club_name, email } = result.rows[0];
            const fallback = email ? email.split('@')[0] : 'Life Care';
            return (club_name && club_name.trim() !== '') ? club_name.trim() : fallback;
        }
        return 'Life Care';
    }

    async completeSetup(ownerId, adminUserId) {
        const q = queries.completeSetup(ownerId);
        await db.query(q.text, q.values);
        await audit.logAction(adminUserId, 'SETUP_COMPLETE', 'admin_config', ownerId);
    }

    async updateAdminConfig(shakeAmount, threshold, ownerId, actionUserId) {
        const current = await db.query(queries.getAdminConfig(ownerId).text, queries.getAdminConfig(ownerId).values);
        let newShake = shakeAmount !== undefined ? Math.round(shakeAmount * 100) : current.rows[0].default_shake_amount;
        let newThreshold = threshold !== undefined ? threshold : current.rows[0].low_stock_threshold;
        
        const q = queries.updateAdminConfig(newShake, newThreshold, ownerId);
        await db.query(q.text, q.values);
        
        await audit.logAction(actionUserId, 'CONFIG_UPDATE', 'admin_config', ownerId, null, {
            default_shake_amount: newShake,
            low_stock_threshold: newThreshold
        });
    }


}

module.exports = new SettingsService();
