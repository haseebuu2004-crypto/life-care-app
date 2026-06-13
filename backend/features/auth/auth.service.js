const bcrypt = require('bcryptjs');
const db = require('../../db');
const queries = require('./auth.queries');
const audit = require('../../shared/services/auditLogService');
const notificationService = require('../notifications/notifications.service'); // Same relative path from features/auth as features/settings
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const MAX_ACTIVE_SESSIONS = 3;
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

        const { sessionId, rawToken } = await this._generateSession(user, ip, ua);

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
        return { sessionId: rawToken, user };
    }

    async _generateSession(user, ip, ua) {
        // Enforce concurrency limit: delete oldest if we are AT or ABOVE the limit
        const evictQ = queries.evictOldestSessions(user.id, MAX_ACTIVE_SESSIONS - 1);
        await db.query(evictQ.text, evictQ.values);

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 8 * 3600000).toISOString(); // 8 hours
        
        // Use user.owner_id as tenantId
        const sessQ = queries.createSession(user.id, tokenHash, user.owner_id || null, expiresAt, ip, ua);
        const sessionRes = await db.query(sessQ.text, sessQ.values);
        const sessionId = sessionRes.rows[0].id;
        
        return { sessionId, rawToken, tokenHash };
    }

    async logout(sessionToken, userId) {
        if (sessionToken) {
            const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
            const q = queries.invalidateSessionByHash(tokenHash);
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
        const normalizedEmail = email.trim().toLowerCase();
        const q = queries.getUserByEmail(normalizedEmail);
        const result = await db.query(q.text, q.values);
        if (result.rows.length > 0 && result.rows[0].is_active) {
            const userId = result.rows[0].id;
            const registeredEmail = result.rows[0].email;
            
            // Invalidate all previously unused tokens for this user (concurrent-request safety)
            const invQ = queries.invalidateOldPasswordResets(userId);
            await db.query(invQ.text, invQ.values);

            // Generate cryptographically secure token
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
            
            // 15-minute expiry window
            const expires = new Date(Date.now() + 15 * 60000).toISOString();
            
            const resetQ = queries.createPasswordReset(userId, tokenHash, expires);
            await db.query(resetQ.text, resetQ.values);
            
            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;
            
            if (process.env.SMTP_USER) {
                try {
                    await transporter.sendMail({
                        from: '"Life Care System" <noreply@lifecare.com>',
                        to: registeredEmail,
                        subject: "Password Reset Request",
                        text: `You requested a password reset. Please use the following link to reset your password. This link is valid for 15 minutes.\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`
                    });
                } catch (err) {
                    // Log delivery failure without exposing the token
                    console.error("SMTP delivery failed for password reset:", err.message);
                    console.log(`[FALLBACK] Password reset email queued for user ${userId}`);
                }
            } else {
                // Development-only stub — still avoids logging the raw token in production
                if (process.env.NODE_ENV !== 'production') {
                    console.log(`[DEV ONLY] Reset link for ${email}: ${resetLink}`);
                } else {
                    console.log(`[FALLBACK] Password reset email queued for user ${userId}`);
                }
            }
            
            return rawToken;
        }
        return null;
    }

    async resetPassword(token, newPassword) {
        if (!token || !newPassword) throw new Error("Invalid request");
        if (newPassword.length < 8) throw new Error("Password must be at least 8 characters.");
        
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        
        // Look up the token record regardless of state so we can give specific errors
        const lookupQ = queries.getPasswordResetByHash(tokenHash);
        const result = await db.query(lookupQ.text, lookupQ.values);
        
        if (result.rows.length === 0) {
            throw new Error("This reset token is invalid. Please request a new password reset.");
        }
        
        const resetRecord = result.rows[0];
        
        // Check: already used?
        if (resetRecord.used_at !== null) {
            throw new Error("This reset token has already been used. Please request a new password reset.");
        }
        
        // Check: expired?
        if (new Date(resetRecord.expires_at) <= new Date()) {
            throw new Error("This reset token has expired. Please request a new password reset.");
        }
        
        // All checks pass — execute password update, token consumption, and session
        // invalidation inside a single transaction for atomicity
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            const hash = await bcrypt.hash(newPassword, 12);
            
            // 1. Update password
            const updQ = queries.updateUserPassword(hash, resetRecord.user_id);
            await client.query(updQ.text, updQ.values);
            
            // 2. Consume the token immediately
            const consQ = queries.consumePasswordReset(tokenHash);
            await client.query(consQ.text, consQ.values);
            
            // 3. Invalidate ALL sessions for this user (force re-login on every device)
            const invQ = queries.invalidateAllSessions(resetRecord.user_id);
            await client.query(invQ.text, invQ.values);
            
            await client.query('COMMIT');
        } catch (txErr) {
            await client.query('ROLLBACK');
            throw txErr;
        } finally {
            client.release();
        }

        await audit.logAction(resetRecord.user_id, 'PASSWORD_RESET');
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
            const tokenHash = crypto.createHash('sha256').update(sessionId).digest('hex');
            const iQ = queries.invalidateOtherSessions(userId, tokenHash);
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
        const q = queries.getUserById(userId);
        const userRes = await db.query(q.text, q.values);
        if (userRes.rows.length === 0) throw new Error("User not found");
        
        const { rawToken } = await this._generateSession(userRes.rows[0], ip, ua);
        return rawToken;
    }

    async invalidateSession(sessionId) {
        const q = queries.invalidateSession(sessionId);
        await db.query(q.text, q.values);
    }

    async invalidateAllSessions(userId) {
        const iQ = queries.invalidateAllSessions(userId);
        await db.query(iQ.text, iQ.values);
    }

    async getActiveSessions(userId, currentSessionToken) {
        let currentTokenHash = null;
        if (currentSessionToken) {
            currentTokenHash = crypto.createHash('sha256').update(currentSessionToken).digest('hex');
        }
        
        const q = queries.getActiveSessionsForUser(userId);
        const res = await db.query(q.text, q.values);
        
        // Find the DB ID for the current session token to mark it as is_current
        let currentSessionId = null;
        if (currentTokenHash) {
            const currentQ = queries.getSessionByHash(currentTokenHash);
            const currentRes = await db.query(currentQ.text, currentQ.values);
            if (currentRes.rows.length > 0) currentSessionId = currentRes.rows[0].session_id;
        }

        return res.rows.map(row => ({
            id: row.id,
            device_info: row.device_info,
            ip_address: row.ip_address,
            created_at: row.created_at,
            last_seen_at: row.last_seen_at,
            is_current: row.id === currentSessionId
        }));
    }

    async revokeSession(userId, sessionIdToRevoke) {
        const q = queries.invalidateUserSessionById(userId, sessionIdToRevoke);
        await db.query(q.text, q.values);
    }

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------
    async validateSession(sessionToken) {
        if (!sessionToken) throw new Error("Access denied: Missing token");
        
        const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
        const q = queries.getSessionByHash(tokenHash);
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
        const bQ = queries.bumpSessionActivityByHash(tokenHash);
        db.query(bQ.text, bQ.values).catch(e => console.error("Failed to bump session activity", e));
        
        return user;
    }
}

module.exports = new AuthService();
