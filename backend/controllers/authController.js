const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { SECRET } = require('../middleware/authMiddleware');
const admin = require('../config/firebase');
const { isAdminEmail } = require('../utils/adminHelper');

exports.login = (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success: false, message: "Username and password required" });

        db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

                const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, SECRET, { expiresIn: '8h' });
                const ua = req.headers['user-agent'] || '';
                const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
                const isMobile = /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
                const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)[/\s]([\d.]+)/)?.[1] || 'Unknown';

                db.run(
                    'INSERT INTO login_history (user_id, username, role, device, browser, ip) VALUES (?, ?, ?, ?, ?, ?)',
                    [user.id, user.username, user.role, isMobile, browser, ip],
                    function(err) {
                        if (err) return res.status(500).json({ success: false, message: err.message });
                        res.json({ token, role: user.role, username: user.username, email: user.email, sessionId: this.lastID });
                    }
                );
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ success: false, message: "ID token is required" });

        if (!admin || !admin.apps.length) {
            console.warn("Firebase Admin SDK is not initialized correctly. Skipping actual verification for demonstration.");
            // We should enforce this in production
        }

        // Verify Firebase Token
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (verifyError) {
            return res.status(401).json({ success: false, message: "Invalid or expired Google token" });
        }

        const { email, name, uid } = decodedToken;
        // username defaults to email local part if name is not available
        const defaultUsername = (name || email.split('@')[0]).trim();
        const normalizedEmail = String(email).trim().toLowerCase();

        db.get('SELECT * FROM users WHERE LOWER(email) = ? OR google_id = ?', [normalizedEmail, uid], (err, user) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

            const finishLogin = (userData) => {
                const token = jwt.sign({ id: userData.id, username: userData.username, email: userData.email, role: userData.role }, SECRET, { expiresIn: '8h' });
                const ua = req.headers['user-agent'] || '';
                const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
                const isMobile = /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
                const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)[/\s]([\d.]+)/)?.[1] || 'Unknown';

                db.run(
                    'INSERT INTO login_history (user_id, username, role, device, browser, ip) VALUES (?, ?, ?, ?, ?, ?)',
                    [userData.id, userData.username, userData.role, isMobile, browser, ip],
                    function(err) {
                        if (err) return res.status(500).json({ success: false, message: err.message });
                        res.json({ token, role: userData.role, username: userData.username, email: userData.email, sessionId: this.lastID });
                    }
                );
            };

            if (user) {
                let updatedRole = user.role;
                if (isAdminEmail(normalizedEmail) && user.role !== 'admin') {
                    updatedRole = 'admin';
                    db.run('UPDATE users SET role = ? WHERE id = ?', ['admin', user.id], (roleErr) => {
                        if (roleErr) console.error("Error updating user role", roleErr);
                    });
                }
                user.role = updatedRole; // Update memory object for JWT
                user.email = normalizedEmail; // Ensure the active email is used

                // Link google_id if not present but email matched
                if (!user.google_id) {
                    db.run('UPDATE users SET google_id = ?, auth_provider = ?, email = ? WHERE id = ?', [uid, 'google', normalizedEmail, user.id], (updateErr) => {
                        if (updateErr) console.error("Error linking google ID", updateErr);
                        finishLogin(user);
                    });
                } else {
                    finishLogin(user);
                }
            } else {
                // New user
                const role = isAdminEmail(normalizedEmail) ? 'admin' : 'user';
                db.run(
                    'INSERT INTO users (username, email, google_id, auth_provider, role) VALUES (?, ?, ?, ?, ?)',
                    [defaultUsername, normalizedEmail, uid, 'google', role],
                    function(insertErr) {
                        if (insertErr) return res.status(500).json({ success: false, message: insertErr.message });
                        const newUser = { id: this.lastID, username: defaultUsername, email: normalizedEmail, role };
                        finishLogin(newUser);
                    }
                );
            }
        });
    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.logout = (req, res) => {
    try {
        const { sessionId } = req.body;
        if (sessionId) {
            db.run('UPDATE login_history SET logout_time = CURRENT_TIMESTAMP WHERE id = ?', [sessionId]);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLoginHistory = (req, res) => {
    try {
        db.all('SELECT * FROM login_history ORDER BY login_time DESC LIMIT 200', [], (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: rows });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
