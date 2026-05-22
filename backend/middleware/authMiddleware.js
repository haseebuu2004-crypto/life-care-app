const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'fallback-refresh-secret-key';

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
    // Rely on JWT embedded owner_id for perfect Staff/Admin multi-tenant isolation.
    // Fallback to email/username only if legacy token is used before they expire in 7d.
    return req.user.owner_id || (req.user.email ? req.user.email.trim().toLowerCase() : (req.user.username || String(req.user.id)));
};

module.exports = { authenticateToken, SECRET, REFRESH_SECRET, getOwnerId };
