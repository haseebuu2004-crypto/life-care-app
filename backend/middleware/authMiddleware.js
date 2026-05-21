const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "Access denied: Missing token" });

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Access denied: Invalid or expired token" });
        req.user = user;
        next();
    });
}

const getOwnerId = (req) => {
    // Force use of Google email for strict, permanent SaaS workspace mapping.
    // Fallback to username for local default admin/user accounts.
    return req.user.email ? req.user.email.trim().toLowerCase() : (req.user.username || String(req.user.id));
};

module.exports = { authenticateToken, SECRET, getOwnerId };
