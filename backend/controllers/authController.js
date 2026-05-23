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
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.selectRole = async (req, res) => {
    try {
        const { selectedRole, password } = req.body;
        const user = req.user; 

        if (!user || !user.email) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const allowedRoles = ['admin', 'user'];

        if (!allowedRoles.includes(selectedRole)) {
            return res.status(403).json({ success: false, message: "Role not permitted" });
        }

        if (selectedRole === 'admin') {
            const adminPassword = process.env.ADMIN_PASSWORD;
            if (!adminPassword) {
                console.error("CRITICAL: ADMIN_PASSWORD environment variable is missing.");
                return res.status(500).json({ success: false, message: "Server Configuration Error" });
            }
            if (password !== adminPassword) {
                return res.status(401).json({ success: false, message: "Incorrect Admin Password" });
            }
        } else if (selectedRole === 'user') {
            const userPassword = process.env.USER_PASSWORD;
            if (!userPassword) {
                console.error("CRITICAL: USER_PASSWORD environment variable is missing.");
                return res.status(500).json({ success: false, message: "Server Configuration Error" });
            }
            if (password !== userPassword) {
                return res.status(401).json({ success: false, message: "Incorrect User Password" });
            }
        }

        const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: selectedRole, owner_id: user.owner_id }, SECRET, { expiresIn: '15m' });
        const refreshToken = await generateRefreshToken(user.id);
        
        const ua = req.headers['user-agent'] || '';
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
        const isMobile = /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
        const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)[/\s]([\d.]+)/)?.[1] || 'Unknown';

        const insertRes = await pool.query(
            'INSERT INTO login_history (user_id, username, role, device, browser, ip) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [user.id, user.username, selectedRole, isMobile, browser, ip]
        );
        
        res.json({ 
            token, 
            refreshToken,
            role: selectedRole, 
            user: { id: user.id, username: user.username, email: user.email },
            sessionId: insertRes.rows[0].id 
        });

    } catch (error) {
        console.error("Select Role Error:", error);
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
