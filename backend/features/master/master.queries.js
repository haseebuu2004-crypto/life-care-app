module.exports = {
    getMasterAppStatsAdmins: () => ({
        text: `SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = true`,
        values: []
    }),
    getMasterAppStatsUsers: () => ({
        text: `SELECT COUNT(*) FROM users WHERE role = 'user' AND is_active = true`,
        values: []
    }),
    getMasterAppStatsSessions: () => ({
        text: `SELECT COUNT(DISTINCT user_id) FROM sessions WHERE expires_at > NOW() AND invalidated_at IS NULL AND last_activity_at > NOW() - INTERVAL '1 day'`,
        values: []
    }),
    getMasterLiveSessions: () => ({
        text: `SELECT s.id, s.ip_address, s.device_info, s.created_at, s.expires_at, s.invalidated_at, s.last_activity_at, u.email, u.role
               FROM sessions s JOIN users u ON s.user_id = u.id WHERE u.role != 'master' ORDER BY s.last_activity_at DESC`,
        values: []
    }),
    getMasterActivityLog: () => ({
        text: `SELECT a.id, a.action, a.table_name, a.created_at, u.email as actor_email, u.role as actor_role
               FROM audit_log a JOIN users u ON a.actor_id = u.id ORDER BY a.created_at DESC LIMIT 500`,
        values: []
    }),
    getMasterAdmins: () => ({
        text: `SELECT 
                u.id, u.email, u.role, u.is_active, u.created_at, u.last_login_at, u.force_password_change, ac.club_name,
                (SELECT COUNT(*) FROM users sub WHERE sub.owner_id = u.id AND sub.role = 'user' AND sub.is_active = true) as user_count,
                COALESCE((SELECT json_agg(json_build_object('id', sub.id, 'email', sub.email, 'role', sub.role, 'is_active', sub.is_active, 'created_at', sub.created_at, 'last_login_at', sub.last_login_at)) FROM users sub WHERE sub.owner_id = u.id AND sub.role = 'user'), '[]'::json) as users
               FROM users u LEFT JOIN admin_config ac ON ac.owner_id = u.id WHERE u.role = 'admin' ORDER BY u.created_at DESC`,
        values: []
    }),
    checkMasterEmailExists: (email) => ({
        text: `SELECT id FROM users WHERE email = $1`,
        values: [email]
    }),
    createClubAdmin: (email, hash, createdBy) => ({
        text: `INSERT INTO users (email, password_hash, role, owner_id, force_password_change, created_by) VALUES ($1, $2, 'admin', null, true, $3) RETURNING id`,
        values: [email, hash, createdBy]
    }),
    setAdminOwnerId: (id) => ({
        text: `UPDATE users SET owner_id = $1 WHERE id = $1`,
        values: [id]
    }),
    createAdminConfigRecord: (ownerId) => ({
        text: `INSERT INTO admin_config (owner_id) VALUES ($1)`,
        values: [ownerId]
    }),
    getUserRoleStatus: (id) => ({
        text: `SELECT is_active, role FROM users WHERE id = $1`,
        values: [id]
    }),
    getUserRoleActiveStatus: (id) => ({
        text: `SELECT role FROM users WHERE id = $1 AND is_active = true`,
        values: [id]
    }),
    forceResetAdminPassword: (hash, id) => ({
        text: `UPDATE users SET password_hash = $1, force_password_change = true, failed_login_count = 0, locked_until = NULL WHERE id = $2`,
        values: [hash, id]
    }),
    deleteClubAdminAndSubordinates: (id) => ({
        text: `UPDATE users SET is_active = false WHERE (id = $1 OR owner_id = $1) AND role != 'master'`,
        values: [id]
    }),
    invalidateClubAdminSessions: (id) => ({
        text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id IN (SELECT id FROM users WHERE id = $1 OR owner_id = $1) AND invalidated_at IS NULL`,
        values: [id]
    }),
    toggleAdminStatus: (newStatus, id) => ({
        text: `UPDATE users SET is_active = $1 WHERE id = $2 OR owner_id = $2`,
        values: [newStatus, id]
    }),
    checkAdminRoleOnly: (id) => ({
        text: `SELECT id FROM users WHERE id = $1 AND role = 'admin'`,
        values: [id]
    })
};
