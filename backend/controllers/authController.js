const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const audit = require('../services/auditLogService');
// Optional: Using a real mailer here. Stubbed for rebuild focus unless Resend key is present.

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

        const normalizedEmail = email.trim().toLowerCase();
        
        const result = await db.query(`SELECT * FROM users WHERE email = $1`, [normalizedEmail]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials (not added by master)" });
        }

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: "Account has been deactivated" });
        }

        if (user.locked_until && new Date() < new Date(user.locked_until)) {
            const mins = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
            return res.status(403).json({ success: false, message: `Account locked. Try again in ${mins} minutes.` });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            const newFails = user.failed_login_count + 1;
            let lockedUntil = null;
            if (newFails >= 3) {
                lockedUntil = new Date(Date.now() + 15 * 60000).toISOString();
            }
            await db.query(
                `UPDATE users SET failed_login_count = $1, locked_until = $2 WHERE id = $3`,
                [newFails, lockedUntil, user.id]
            );
            await audit.logAction(user.id, 'LOGIN_FAIL');
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Success
        await db.query(
            `UPDATE users SET failed_login_count = 0, locked_until = NULL, last_login_at = NOW() WHERE id = $1`,
            [user.id]
        );

        const ua = req.headers['user-agent'] || '';
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
        const expiresAt = new Date(Date.now() + 8 * 3600000).toISOString(); // 8 hours

        const sessionRes = await db.query(
            `INSERT INTO sessions (user_id, expires_at, ip_address, device_info) VALUES ($1, $2, $3, $4) RETURNING id`,
            [user.id, expiresAt, ip, ua]
        );
        const sessionId = sessionRes.rows[0].id;

        // Check for new device login
        const prevSessionRes = await db.query(`
            SELECT id FROM sessions 
            WHERE user_id = $1 AND ip_address = $2 AND device_info = $3 AND id != $4
            AND created_at > NOW() - INTERVAL '30 days'
            LIMIT 1
        `, [user.id, ip, ua, sessionId]);
        
        if (prevSessionRes.rowCount === 0) {
            const notifService = require('../services/notificationService');
            await notifService.createNotification(
                user.id, 
                'new_login', 
                'New login to your account', 
                `Login detected from ${ua} at ${ip}. If this was not you, change your password immediately.`, 
                { ip_address: ip, device_info: ua, created_at: new Date() }, 
                true
            );
        }

        await audit.logAction(user.id, 'LOGIN_SUCCESS');

        res.cookie('session_token', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 8 * 3600000
        });

        res.json({ 
            success: true,
            role: user.role,
            user: { id: user.id, email: user.email, role: user.role, forcePasswordChange: user.force_password_change } 
        });
    } catch (error) {
        console.error("Login Route Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.logout = async (req, res) => {
    try {
        const sessionId = req.cookies?.session_token;
        if (sessionId) {
            await db.query(`UPDATE sessions SET invalidated_at = NOW() WHERE id = $1`, [sessionId]);
            if (req.user) await audit.logAction(req.user.id, 'LOGOUT');
        }
        res.clearCookie('session_token');
        res.json({ success: true, message: "Logged out" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Logout error" });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.user;
        
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
        }

        const userRecord = (await db.query(`SELECT password_hash FROM users WHERE id = $1`, [user.id])).rows[0];
        
        // Only require current password if they aren't forced to change it right now (temp password)
        if (!user.force_password_change) {
            if (!currentPassword) return res.status(400).json({ success: false, message: "Current password required" });
            const valid = await bcrypt.compare(currentPassword, userRecord.password_hash);
            if (!valid) return res.status(400).json({ success: false, message: "Incorrect current password" });
        }

        const hash = await bcrypt.hash(newPassword, 12);

        await db.query(`UPDATE users SET password_hash = $1, force_password_change = false WHERE id = $2`, [hash, user.id]);
        
        // Invalidate all existing sessions
        await db.query(`UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND invalidated_at IS NULL`, [user.id]);
        
        await audit.logAction(user.id, 'PASSWORD_CHANGE');
        
        // Re-login essentially
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
        const expiresAt = new Date(Date.now() + 8 * 3600000).toISOString();
        const sessionRes = await db.query(
            `INSERT INTO sessions (user_id, expires_at, ip_address, device_info) VALUES ($1, $2, $3, $4) RETURNING id`,
            [user.id, expiresAt, ip, req.headers['user-agent']]
        );

        res.cookie('session_token', sessionRes.rows[0].id, { httpOnly: true, sameSite: 'lax', maxAge: 8 * 3600000 });
        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ success: false, message: "Failed to update password" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email required" });

        // Generic success message to prevent email enumeration
        res.json({ success: true, message: "If that email exists, reset instructions have been sent." });

        const result = await db.query(`SELECT id FROM users WHERE email = $1 AND is_active = true`, [email.trim().toLowerCase()]);
        if (result.rows.length > 0) {
            const userId = result.rows[0].id;
            const expires = new Date(Date.now() + 3600000).toISOString();
            const resetRes = await db.query(
                `INSERT INTO password_resets (user_id, expires_at) VALUES ($1, $2) RETURNING id`,
                [userId, expires]
            );
            const token = resetRes.rows[0].id;
            // TODO: This OTP/Token logic is a stub. 
            // Replace with a real backend email service (like Resend, SendGrid) before production.
            console.log(`[STUB] Send email to ${email} with token: ${token}`);
        }
    } catch (error) {
        console.error("Forgot Password Error:", error);
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword || newPassword.length < 8) return res.status(400).json({ success: false, message: "Invalid request" });

        const result = await db.query(`SELECT * FROM password_resets WHERE id = $1 AND expires_at > NOW() AND used_at IS NULL`, [token]);
        if (result.rows.length === 0) return res.status(400).json({ success: false, message: "Invalid or expired token" });
        
        const resetRecord = result.rows[0];
        const hash = await bcrypt.hash(newPassword, 12);

        await db.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hash, resetRecord.user_id]);
        await db.query(`UPDATE password_resets SET used_at = NOW() WHERE id = $1`, [token]);
        await db.query(`UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND invalidated_at IS NULL`, [resetRecord.user_id]);
        await audit.logAction(resetRecord.user_id, 'PASSWORD_CHANGE');
        
        res.json({ success: true, message: "Password has been reset. Please log in." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Reset failed" });
    }
};

exports.getSession = (req, res) => {
    res.json({ success: true, user: { id: req.user.id, email: req.user.email, role: req.user.role, forcePasswordChange: req.user.force_password_change } });
};
