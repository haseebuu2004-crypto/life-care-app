const db = require('../db');

async function authenticateToken(req, res, next) {
    const sessionId = req.cookies?.session_token;

    if (!sessionId) return res.status(401).json({ success: false, message: "Access denied: Missing token" });

    try {
        const result = await db.query(
            `SELECT s.id as session_id, s.expires_at, u.id, u.email, u.role, u.owner_id, u.is_active, u.force_password_change 
             FROM sessions s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.id = $1 AND s.expires_at > NOW() AND s.invalidated_at IS NULL`,
            [sessionId]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ success: false, message: "Access denied: Invalid or expired session" });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: "Account is deactivated." });
        }

        req.user = user;
        
        // Force password change interceptor
        if (user.force_password_change && req.path !== '/auth/change-password' && req.path !== '/auth/logout') {
            return res.status(403).json({ 
                success: false, 
                forcePasswordChange: true, 
                message: "You must change your temporary password before continuing." 
            });
        }

        // Asynchronously bump last activity
        db.query(`UPDATE sessions SET last_activity_at = NOW() WHERE id = $1`, [sessionId]).catch(e => console.error("Failed to bump session activity", e));

        next();
    } catch (dbErr) {
        console.error("Session verification error:", dbErr);
        return res.status(500).json({ success: false, message: "Internal server error during auth." });
    }
}

module.exports = { authenticateToken };
