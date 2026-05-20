function authorizeRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ success: false, message: "Forbidden: No user role found" });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
        }
        
        next();
    };
}

const ADMIN_ONLY = ['admin'];
const ALL_ROLES = ['admin', 'user'];

module.exports = { authorizeRole, ADMIN_ONLY, ALL_ROLES };
