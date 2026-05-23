const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');
const { SECRET, REFRESH_SECRET } = require('../middleware/authMiddleware');
const admin = require('../config/firebase');

const generateRefreshToken = async (userId) => {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await pool.query('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)', [token, userId, expiresAt]);
    return token;
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success: false, message: "Username and password required" });

        const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = rows[0];
        
        if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, username: user.username, email: user.email, owner_id: user.owner_id, role: user.role }, SECRET, { expiresIn: '15m' });
        const refreshToken = await generateRefreshToken(user.id);
        
        const ua = req.headers['user-agent'] || '';
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
        const isMobile = /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
        const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)[/\s]([\d.]+)/)?.[1] || 'Unknown';

        const insertRes = await pool.query(
            'INSERT INTO login_history (user_id, username, role, device, browser, ip) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [user.id, user.username, user.role, isMobile, browser, ip]
        );
        
        res.json({ token, refreshToken, username: user.username, email: user.email, sessionId: insertRes.rows[0].id });
    } catch (error) {
        console.error("Login Route Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ success: false, message: "ID token is required" });

        if (!admin || !admin.apps.length) {
            console.error("CRITICAL: Firebase Admin SDK is not initialized correctly. Cannot verify tokens.");
            return res.status(500).json({ success: false, message: "Server is missing Firebase Configuration. Please check Render Environment Variables." });
        }

        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (verifyError) {
            return res.status(401).json({ success: false, message: "Invalid or expired Google token" });
        }

        const { email, name, uid } = decodedToken;
        
        const baseName = (name || email.split('@')[0]).trim().replace(/\s+/g, '_');
        const uniqueSuffix = Math.random().toString(36).substring(2, 8);
        const defaultUsername = `${baseName}_${uniqueSuffix}`;
        
        const normalizedEmail = String(email).trim().toLowerCase();

        const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1 OR google_id = $2', [normalizedEmail, uid]);
        const user = rows[0];

        const finishLogin = async (userData) => {
            const token = jwt.sign({ id: userData.id, username: userData.username, email: userData.email, role: 'pending', owner_id: userData.owner_id }, SECRET, { expiresIn: '15m' });
            const refreshToken = await generateRefreshToken(userData.id);
            const allowedRoles = ['admin', 'user'];
            res.json({ 
                token, 
                refreshToken,
                user: { username: userData.username, email: userData.email }, 
                allowedRoles 
            });
        };

        if (user) {
            user.email = normalizedEmail; 
            if (!user.google_id) {
                try {
                    await pool.query('UPDATE users SET google_id = $1, auth_provider = $2, email = $3 WHERE id = $4', [uid, 'google', normalizedEmail, user.id]);
                } catch (updateErr) {
                    console.error("Error linking google ID", updateErr);
                }
            }
            await finishLogin(user);
        } else {
            const insertRes = await pool.query(
                'INSERT INTO users (username, email, google_id, auth_provider, role, owner_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [defaultUsername, normalizedEmail, uid, 'google', 'user', normalizedEmail]
            );
            const newUser = { id: insertRes.rows[0].id, username: defaultUsername, email: normalizedEmail, role: 'user', owner_id: normalizedEmail };
            await finishLogin(newUser);
        }
    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error: " + (error.message || String(error)) });
    }
};

exports.selectRole = async (req, res) => {
    try {
        const { selectedRole } = req.body;
        const user = req.user; 

        if (!user || !user.owner_id) {
            return res.status(401).json({ success: false, message: "Unauthorized: Missing Workspace Context" });
        }

        const allowedRoles = ['admin', 'user'];
        if (!allowedRoles.includes(selectedRole)) {
            return res.status(403).json({ success: false, message: "Role not permitted" });
        }

        let { rows } = await pool.query('SELECT id, password FROM users WHERE username = $1 AND owner_id = $2', [selectedRole, user.owner_id]);
        let roleUser = rows[0];

        if (!roleUser) {
            // Workspace doesn't have this role setup yet, initialize it
            const insertRes = await pool.query(
                'INSERT INTO users (username, email, role, owner_id) VALUES ($1, $2, $3, $4) RETURNING id',
                [selectedRole, null, selectedRole, user.owner_id]
            );
            roleUser = { id: insertRes.rows[0].id, password: null };
        }

        res.json({ success: true, hasPassword: !!roleUser.password });

    } catch (error) {
        console.error("Select Role Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.setPassword = async (req, res) => {
    try {
        const { selectedRole, password } = req.body;
        const user = req.user;
        if (!user || !user.owner_id) return res.status(401).json({ success: false, message: "Unauthorized" });

        const { rows } = await pool.query('SELECT id, password FROM users WHERE username = $1 AND owner_id = $2', [selectedRole, user.owner_id]);
        if (!rows[0]) return res.status(404).json({ success: false, message: "Role not initialized" });
        if (rows[0].password) return res.status(400).json({ success: false, message: "Password already set" });

        if (!password || password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        
        const hash = await bcrypt.hash(password, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, rows[0].id]);

        await exports.finalizeLogin(req, res, user, selectedRole);
    } catch (error) {
        console.error("Set Password Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.verifyPassword = async (req, res) => {
    try {
        const { selectedRole, password } = req.body;
        const user = req.user;
        if (!user || !user.owner_id) return res.status(401).json({ success: false, message: "Unauthorized" });

        const { rows } = await pool.query('SELECT id, password FROM users WHERE username = $1 AND owner_id = $2', [selectedRole, user.owner_id]);
        const roleUser = rows[0];

        if (!roleUser || !roleUser.password) return res.status(400).json({ success: false, message: "Password not set" });

        const isValid = await bcrypt.compare(password, roleUser.password);
        if (!isValid) return res.status(401).json({ success: false, message: "Incorrect Password" });

        await exports.finalizeLogin(req, res, user, selectedRole);
    } catch (error) {
        console.error("Verify Password Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.finalizeLogin = async (req, res, googleUser, selectedRole) => {
    // Generate JWT for the verified role
    const token = jwt.sign({ id: googleUser.id, username: googleUser.username, email: googleUser.email, role: selectedRole, owner_id: googleUser.owner_id }, SECRET, { expiresIn: '15m' });
    const refreshToken = await generateRefreshToken(googleUser.id);
    
    const ua = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const isMobile = /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
    const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)[/\s]([\d.]+)/)?.[1] || 'Unknown';

    const insertRes = await pool.query(
        'INSERT INTO login_history (user_id, username, role, device, browser, ip) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [googleUser.id, googleUser.username, selectedRole, isMobile, browser, ip]
    );
    
    res.json({ 
        token, 
        refreshToken,
        role: selectedRole, 
        user: { id: googleUser.id, username: googleUser.username, email: googleUser.email },
        sessionId: insertRes.rows[0].id 
    });
};

const nodemailer = require('nodemailer');

exports.forgotPassword = async (req, res) => {
    try {
        const { selectedRole } = req.body;
        const user = req.user;
        if (!user || !user.owner_id) return res.status(401).json({ success: false, message: "Unauthorized" });

        const { rows } = await pool.query('SELECT id, email FROM users WHERE username = $1 AND owner_id = $2', [selectedRole, user.owner_id]);
        if (!rows[0]) return res.status(404).json({ success: false, message: "Role not initialized" });

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 15 * 60000); // 15 minutes

        await pool.query('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3', [resetToken, tokenExpiry, rows[0].id]);

        // Ethereal Email for testing (generates a mock inbox URL in console)
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass }
        });
        const frontendOrigin = process.env.FRONTEND_URL || req.headers.origin || 'http://localhost:5173';
        const resetLink = `${frontendOrigin}/reset-password/${resetToken}`;
        const info = await transporter.sendMail({
            from: '"Life Care System" <noreply@lifecare.com>',
            to: user.email || 'user@example.com',
            subject: 'Password Reset Request',
            text: `You requested a password reset for ${selectedRole}. Click here to reset: ${resetLink}`,
            html: `<p>You requested a password reset for <b>${selectedRole}</b>.</p><p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 15 minutes.</p>`
        });

        console.log("Mock Email Sent! View it here:", nodemailer.getTestMessageUrl(info));
        res.json({ success: true, message: "Reset link sent to your workspace email." });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword || newPassword.length < 8) return res.status(400).json({ success: false, message: "Invalid request" });

        const { rows } = await pool.query('SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()', [token]);
        if (!rows[0]) return res.status(400).json({ success: false, message: "Reset token is invalid or has expired" });

        const hash = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2', [hash, rows[0].id]);

        res.json({ success: true, message: "Password reset successfully. You can now login." });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ success: false, message: "Refresh token required" });
        
        const { rows } = await pool.query('SELECT rt.*, u.username, u.email, u.owner_id, u.role FROM refresh_tokens rt JOIN users u ON rt.user_id = u.id WHERE rt.token = $1', [refreshToken]);
        const record = rows[0];
        
        if (!record) return res.status(403).json({ success: false, message: "Invalid refresh token" });
        if (new Date(record.expires_at) < new Date()) {
            await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [record.id]);
            return res.status(403).json({ success: false, message: "Refresh token expired" });
        }
        
        const newAccessToken = jwt.sign({ id: record.user_id, username: record.username, email: record.email, owner_id: record.owner_id, role: record.role }, SECRET, { expiresIn: '15m' });
        
        res.json({ success: true, token: newAccessToken });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.logout = async (req, res) => {
    try {
        const { sessionId, refreshToken } = req.body;
        if (sessionId) {
            await pool.query('UPDATE login_history SET logout_time = CURRENT_TIMESTAMP WHERE id = $1', [sessionId]);
        }
        if (refreshToken) {
            await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLoginHistory = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM login_history ORDER BY login_time DESC LIMIT 200');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
