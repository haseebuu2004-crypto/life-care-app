const authService = require('../../features/auth/auth.service');

async function authenticateToken(req, res, next) {
    const sessionId = req.cookies?.session_token;

    if (!sessionId) return res.status(401).json({ success: false, message: "Access denied: Missing token" });

    try {
        const user = await authService.validateSession(sessionId);

        req.user = user;
        
        // Force password change interceptor
        if (user.force_password_change && req.path !== '/auth/change-password' && req.path !== '/auth/logout') {
            return res.status(403).json({ 
                success: false, 
                forcePasswordChange: true, 
                message: "You must change your temporary password before continuing." 
            });
        }

        next();
    } catch (err) {
        if (err.message.includes("Access denied:") || err.message.includes("deactivated")) {
            return res.status(err.status || 403).json({ success: false, message: err.message });
        }
        console.error("Session verification error:", err);
        return res.status(500).json({ success: false, message: "Internal server error during auth." });
    }
}

module.exports = { authenticateToken };
