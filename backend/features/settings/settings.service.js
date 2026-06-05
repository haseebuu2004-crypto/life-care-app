const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../../db');
const queries = require('./settings.queries');
const audit = require('../../services/auditLogService');
const notificationService = require('../notifications/notifications.service');

// We use pool directly for transactions where necessary
const pool = db.pool;

class SettingsService {
    // ---------------------------------------------------------
    // AUTHENTICATION & LOGIN FLOW
    // ---------------------------------------------------------
    async login(email, password, ip, ua) {
        const normalizedEmail = email.trim().toLowerCase();
        const q = queries.getUserByEmail(normalizedEmail);
        const result = await db.query(q.text, q.values);
        const user = result.rows[0];

        if (!user) throw new Error("Invalid credentials (not added by master)");
        if (!user.is_active) throw new Error("Account has been deactivated");
        
        if (user.locked_until && new Date() < new Date(user.locked_until)) {
            const mins = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
            throw new Error(`Account locked. Try again in ${mins} minutes.`);
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            const newFails = user.failed_login_count + 1;
            let lockedUntil = null;
            if (newFails >= 3) {
                lockedUntil = new Date(Date.now() + 15 * 60000).toISOString();
            }
            const fQ = queries.updateFailedLogin(newFails, lockedUntil, user.id);
            await db.query(fQ.text, fQ.values);
            await audit.logAction(user.id, 'LOGIN_FAIL');
            throw new Error("Invalid email or password");
        }

        // Success Cleanup
        const sQ = queries.updateSuccessLogin(user.id);
        await db.query(sQ.text, sQ.values);

        const expiresAt = new Date(Date.now() + 8 * 3600000).toISOString(); // 8 hours
        const sessQ = queries.createSession(user.id, expiresAt, ip, ua);
        const sessionRes = await db.query(sessQ.text, sessQ.values);
        const sessionId = sessionRes.rows[0].id;

        const prevSessQ = queries.checkPreviousSession(user.id, ip, ua, sessionId);
        const prevSessionRes = await db.query(prevSessQ.text, prevSessQ.values);
        
        if (prevSessionRes.rowCount === 0) {
            await notificationService.createNotification(
                user.id, 'new_login', 'New login to your account',
                `Login detected from ${ua} at ${ip}. If this was not you, change your password immediately.`,
                { ip_address: ip, device_info: ua, created_at: new Date() }, true
            );
        }

        await audit.logAction(user.id, 'LOGIN_SUCCESS');
        return { sessionId, user };
    }

    async logout(sessionId, userId) {
        if (sessionId) {
            const q = queries.invalidateSession(sessionId);
            await db.query(q.text, q.values);
            if (userId) await audit.logAction(userId, 'LOGOUT');
        }
    }

    async changePassword(userId, currentPassword, newPassword, forcePasswordChange, sessionId) {
        if (!newPassword || newPassword.length < 8) throw new Error("New password must be at least 8 characters");

        const userQ = queries.getPasswordHash(userId);
        const userRecord = (await db.query(userQ.text, userQ.values)).rows[0];

        if (!forcePasswordChange) {
            if (!currentPassword) throw new Error("Current password required");
            const valid = await bcrypt.compare(currentPassword, userRecord.password_hash);
            if (!valid) throw new Error("Incorrect current password");
        }

        const hash = await bcrypt.hash(newPassword, 12);
        const updQ = queries.updateUserPassword(hash, userId);
        await db.query(updQ.text, updQ.values);

        // Invalidate ALL OTHER sessions on password change
        if (sessionId) {
            const iQ = queries.invalidateOtherSessions(userId, sessionId);
            await db.query(iQ.text, iQ.values);
        } else {
            const iQ = queries.invalidateAllSessions(userId);
            await db.query(iQ.text, iQ.values);
        }

        await audit.logAction(userId, 'PASSWORD_CHANGE');
    }

    async createNewSession(userId, ip, ua) {
        const expiresAt = new Date(Date.now() + 8 * 3600000).toISOString();
        const sessQ = queries.createSession(userId, expiresAt, ip, ua);
        const res = await db.query(sessQ.text, sessQ.values);
        return res.rows[0].id;
    }

    async forgotPassword(email) {
        const q = queries.checkEmailExists(email);
        const result = await db.query(q.text, q.values);
        if (result.rows.length > 0 && result.rows[0].is_active) {
            const userId = result.rows[0].id;
            const expires = new Date(Date.now() + 3600000).toISOString();
            const resetQ = queries.createPasswordReset(userId, expires);
            const resetRes = await db.query(resetQ.text, resetQ.values);
            const token = resetRes.rows[0].id;
            console.log(`[STUB] Send email to ${email} with token: ${token}`);
            return token;
        }
        return null;
    }

    async resetPassword(token, newPassword) {
        if (!token || !newPassword || newPassword.length < 8) throw new Error("Invalid request");
        
        const validQ = queries.getValidPasswordReset(token);
        const result = await db.query(validQ.text, validQ.values);
        if (result.rows.length === 0) throw new Error("Invalid or expired token");
        
        const resetRecord = result.rows[0];
        const hash = await bcrypt.hash(newPassword, 12);
        
        const updQ = queries.updateUserPassword(hash, resetRecord.user_id);
        await db.query(updQ.text, updQ.values);

        const consQ = queries.consumePasswordReset(token);
        await db.query(consQ.text, consQ.values);

        const invQ = queries.invalidateAllSessions(resetRecord.user_id);
        await db.query(invQ.text, invQ.values);

        await audit.logAction(resetRecord.user_id, 'PASSWORD_CHANGE');
    }

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
        
        const invQ = queries.invalidateAllSessions(targetId);
        await db.query(invQ.text, invQ.values);
        await audit.logAction(adminUserId, 'USER_DELETE', 'users', targetId);
    }

    async adminUpdateUserPassword(newPassword, targetId, adminUserId, ownerId) {
        if (!newPassword || newPassword.length < 8) throw new Error("Password must be at least 8 characters.");
        const hash = await bcrypt.hash(newPassword, 12);
        
        const updQ = queries.adminUpdateUserPassword(hash, targetId, ownerId);
        const result = await db.query(updQ.text, updQ.values);
        if (result.rowCount === 0) throw new Error("User not found or you don't have permission");
        
        const invQ = queries.invalidateAllSessions(targetId);
        await db.query(invQ.text, invQ.values);
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

    // ---------------------------------------------------------
    // MASTER ADMIN PROVISIONING & TIER 1
    // ---------------------------------------------------------
    async getMasterAppStats() {
        const totalAdminsRes = await db.query(queries.getMasterAppStatsAdmins().text);
        const totalUsersRes = await db.query(queries.getMasterAppStatsUsers().text);
        const activeSessionsRes = await db.query(queries.getMasterAppStatsSessions().text);
        return {
            total_admins: parseInt(totalAdminsRes.rows[0].count),
            total_users: parseInt(totalUsersRes.rows[0].count),
            active_users: parseInt(activeSessionsRes.rows[0].count)
        };
    }

    async getMasterLiveSessions() {
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

    async getMasterActivityLog() {
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

        const invQ = queries.invalidateAllSessions(targetId);
        await db.query(invQ.text, invQ.values);

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

        const updQ = queries.updateAdminClubName(clubName, targetId);
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

module.exports = new SettingsService();
