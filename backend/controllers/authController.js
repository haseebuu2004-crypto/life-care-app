const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { SECRET } = require('../middleware/authMiddleware');
const admin = require('../config/firebase');

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

                const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, SECRET, { expiresIn: '8h' });
                const ua = req.headers['user-agent'] || '';
                const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
                const isMobile = /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
                const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)[/\s]([\d.]+)/)?.[1] || 'Unknown';

                db.run(
                    'INSERT INTO login_history (user_id, username, role, device, browser, ip) VALUES (?, ?, ?, ?, ?, ?)',
                    [user.id, user.username, user.role, isMobile, browser, ip],
                    function(err) {
                        if (err) return res.status(500).json({ success: false, message: err.message });
                        res.json({ token, username: user.username, email: user.email, sessionId: this.lastID });
                    }
                );
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAdminEmails = () => {
    const emails = process.env.ADMIN_EMAILS || 'haseeb@gmail.com,admin@gmail.com';
    return emails.split(',').map(e => e.trim().toLowerCase());
};

exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ success: false, message: "ID token is required" });

        if (!admin || !admin.apps.length) {
            console.warn("Firebase Admin SDK is not initialized correctly. Skipping actual verification for demonstration.");
        }

        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (verifyError) {
            return res.status(401).json({ success: false, message: "Invalid or expired Google token" });
        }

        const { email, name, uid } = decodedToken;
        const defaultUsername = (name || email.split('@')[0]).trim();
        const normalizedEmail = String(email).trim().toLowerCase();

        db.get('SELECT * FROM users WHERE LOWER(email) = ? OR google_id = ?', [normalizedEmail, uid], (err, user) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

            const finishLogin = (userData) => {
                // Initial token does not have a finalized role
                const token = jwt.sign({ id: userData.id, username: userData.username, email: userData.email, role: 'pending' }, SECRET, { expiresIn: '8h' });
                
                const isAdmin = getAdminEmails().includes(userData.email.toLowerCase());
                const allowedRoles = isAdmin ? ['admin', 'user'] : ['user'];

                res.json({ 
                    token, 
                    user: { username: userData.username, email: userData.email }, 
                    allowedRoles 
                });
            };

            if (user) {
                user.email = normalizedEmail; 
                if (!user.google_id) {
                    db.run('UPDATE users SET google_id = ?, auth_provider = ?, email = ? WHERE id = ?', [uid, 'google', normalizedEmail, user.id], (updateErr) => {
                        if (updateErr) console.error("Error linking google ID", updateErr);
                        finishLogin(user);
                    });
                } else {
                    finishLogin(user);
                }
            } else {
                db.run(
                    'INSERT INTO users (username, email, google_id, auth_provider, role) VALUES (?, ?, ?, ?, ?)',
                    [defaultUsername, normalizedEmail, uid, 'google', 'user'],
                    function(insertErr) {
                        if (insertErr) return res.status(500).json({ success: false, message: insertErr.message });
                        const newUser = { id: this.lastID, username: defaultUsername, email: normalizedEmail, role: 'user' };
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

exports.selectRole = (req, res) => {
    try {
        const { selectedRole, password } = req.body;
        const user = req.user; // from authenticateToken middleware

        if (!user || !user.email) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const isAdmin = getAdminEmails().includes(user.email.toLowerCase());
        const allowedRoles = isAdmin ? ['admin', 'user'] : ['user'];

        if (!allowedRoles.includes(selectedRole)) {
            return res.status(403).json({ success: false, message: "Role not permitted" });
        }

        // Verify role password
        if (selectedRole === 'admin') {
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            if (password !== adminPassword) {
                return res.status(401).json({ success: false, message: "Incorrect Admin Password" });
            }
        } else if (selectedRole === 'user') {
            const userPassword = process.env.USER_PASSWORD || 'user123';
            if (password !== userPassword) {
                return res.status(401).json({ success: false, message: "Incorrect User Password" });
            }
        }

        // Issue final token with the selected role
        const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: selectedRole }, SECRET, { expiresIn: '8h' });
        
        const ua = req.headers['user-agent'] || '';
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
        const isMobile = /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
        const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)[/\s]([\d.]+)/)?.[1] || 'Unknown';

        db.run(
            'INSERT INTO login_history (user_id, username, role, device, browser, ip) VALUES (?, ?, ?, ?, ?, ?)',
            [user.id, user.username, selectedRole, isMobile, browser, ip],
            function(err) {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.json({ 
                    token, 
                    role: selectedRole, 
                    user: { id: user.id, username: user.username, email: user.email },
                    sessionId: this.lastID 
                });
            }
        );

    } catch (error) {
        console.error("Select Role Error:", error);
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
