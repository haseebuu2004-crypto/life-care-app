const bcrypt = require('bcryptjs');
const db = require('../../db');
const queries = require('./auth.queries');
const audit = require('../../services/auditLogService');
const notificationService = require('../notifications/notifications.service'); // Same relative path from features/auth as features/settings

class AuthService {
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

    getSession(user) {
        return {
            id: user.id, 
            email: user.email, 
            role: user.role, 
            forcePasswordChange: user.force_password_change 
        };
    }

    // ---------------------------------------------------------
    // PASSWORD MANAGEMENT
    // ---------------------------------------------------------
    async forgotPassword(email) {
        const q = queries.getUserByEmail(email);
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

        if (sessionId) {
            const iQ = queries.invalidateOtherSessions(userId, sessionId);
            await db.query(iQ.text, iQ.values);
        } else {
            const iQ = queries.invalidateAllSessions(userId);
            await db.query(iQ.text, iQ.values);
        }

        await audit.logAction(userId, 'PASSWORD_CHANGE');
    }

    // ---------------------------------------------------------
    // SESSION MANAGEMENT
    // ---------------------------------------------------------
    async createNewSession(userId, ip, ua) {
        const expiresAt = new Date(Date.now() + 8 * 3600000).toISOString();
        const sessQ = queries.createSession(userId, expiresAt, ip, ua);
        const res = await db.query(sessQ.text, sessQ.values);
        return res.rows[0].id;
    }

    async invalidateSession(sessionId) {
        const q = queries.invalidateSession(sessionId);
        await db.query(q.text, q.values);
    }

    async invalidateAllSessions(userId) {
        const iQ = queries.invalidateAllSessions(userId);
        await db.query(iQ.text, iQ.values);
    }

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------
    async validateSession(sessionId) {
        if (!sessionId) throw new Error("Access denied: Missing token");
        
        const q = queries.getSessionById(sessionId);
        const result = await db.query(q.text, q.values);
        
        if (result.rows.length === 0) {
            const err = new Error("Access denied: Invalid or expired session");
            err.status = 403;
            throw err;
        }
        
        const user = result.rows[0];
        
        if (!user.is_active) {
            const err = new Error("Account is deactivated.");
            err.status = 403;
            throw err;
        }
        
        // Asynchronously bump last activity
        const bQ = queries.bumpSessionActivity(sessionId);
        db.query(bQ.text, bQ.values).catch(e => console.error("Failed to bump session activity", e));
        
        return user;
    }
}

module.exports = new AuthService();
