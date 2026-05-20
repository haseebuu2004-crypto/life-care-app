const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { SECRET } = require('../middleware/authMiddleware');

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

                const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '8h' });
                const ua = req.headers['user-agent'] || '';
                const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
                const isMobile = /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
                const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)[/\s]([\d.]+)/)?.[1] || 'Unknown';

                db.run(
                    'INSERT INTO login_history (user_id, username, role, device, browser, ip) VALUES (?, ?, ?, ?, ?, ?)',
                    [user.id, user.username, user.role, isMobile, browser, ip],
                    function(err) {
                        if (err) return res.status(500).json({ success: false, message: err.message });
                        // Return flat data for AuthContext compatibility
                        res.json({ token, role: user.role, username: user.username, sessionId: this.lastID });
                    }
                );
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
