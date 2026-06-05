module.exports = {
    // Auth & Session Queries
    getUserByEmail: (email) => ({
        text: `SELECT * FROM users WHERE email = $1`,
        values: [email]
    }),
    updateFailedLogin: (newFails, lockedUntil, userId) => ({
        text: `UPDATE users SET failed_login_count = $1, locked_until = $2 WHERE id = $3`,
        values: [newFails, lockedUntil, userId]
    }),
    updateSuccessLogin: (userId) => ({
        text: `UPDATE users SET failed_login_count = 0, locked_until = NULL, last_login_at = NOW() WHERE id = $1`,
        values: [userId]
    }),
    createSession: (userId, expiresAt, ip, ua) => ({
        text: `INSERT INTO sessions (user_id, expires_at, ip_address, device_info) VALUES ($1, $2, $3, $4) RETURNING id`,
        values: [userId, expiresAt, ip, ua]
    }),
    checkPreviousSession: (userId, ip, ua, sessionId) => ({
        text: `SELECT id FROM sessions WHERE user_id = $1 AND ip_address = $2 AND device_info = $3 AND id != $4 AND created_at > NOW() - INTERVAL '30 days' LIMIT 1`,
        values: [userId, ip, ua, sessionId]
    }),
    invalidateSession: (sessionId) => ({
        text: `UPDATE sessions SET invalidated_at = NOW() WHERE id = $1`,
        values: [sessionId]
    }),
    invalidateAllSessions: (userId) => ({
        text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND invalidated_at IS NULL`,
        values: [userId]
    }),
    invalidateOtherSessions: (userId, sessionId) => ({
        text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND id != $2 AND invalidated_at IS NULL`,
        values: [userId, sessionId]
    }),
    createPasswordReset: (userId, expiresAt) => ({
        text: `INSERT INTO password_resets (user_id, expires_at) VALUES ($1, $2) RETURNING id`,
        values: [userId, expiresAt]
    }),
    getValidPasswordReset: (token) => ({
        text: `SELECT * FROM password_resets WHERE id = $1 AND expires_at > NOW() AND used_at IS NULL`,
        values: [token]
    }),
    consumePasswordReset: (token) => ({
        text: `UPDATE password_resets SET used_at = NOW() WHERE id = $1`,
        values: [token]
    }),

    // User Management Queries
    getUsers: (ownerId) => ({
        text: `SELECT id, email as username, email, role, is_active, last_login_at FROM users WHERE owner_id = $1 AND is_active = true ORDER BY created_at DESC`,
        values: [ownerId]
    }),
    countStandardUsers: (ownerId) => ({
        text: `SELECT COUNT(*) FROM users WHERE owner_id = $1 AND role = 'user' AND is_active = true`,
        values: [ownerId]
    }),
    checkEmailExists: (email) => ({
        text: `SELECT id, is_active, owner_id FROM users WHERE email = $1`,
        values: [email]
    }),
    reactivateUser: (hash, role, id) => ({
        text: `UPDATE users SET is_active = true, password_hash = $1, role = $2, force_password_change = true, locked_until = NULL WHERE id = $3 RETURNING id, email, role`,
        values: [hash, role, id]
    }),
    createUser: (email, hash, role, ownerId, createdBy) => ({
        text: `INSERT INTO users (email, password_hash, role, owner_id, force_password_change, created_by) VALUES ($1, $2, $3, $4, true, $5) RETURNING id, email, role`,
        values: [email, hash, role, ownerId, createdBy]
    }),
    updateUserRole: (role, id, ownerId) => ({
        text: `UPDATE users SET role = $1 WHERE id = $2 AND owner_id = $3 RETURNING id`,
        values: [role, id, ownerId]
    }),
    deleteUser: (id, ownerId) => ({
        text: `UPDATE users SET is_active = false, locked_until = NOW() WHERE id = $1 AND owner_id = $2 RETURNING id`,
        values: [id, ownerId]
    }),
    getPasswordHash: (userId) => ({
        text: `SELECT password_hash FROM users WHERE id = $1`,
        values: [userId]
    }),
    updateUserPassword: (hash, userId) => ({
        text: `UPDATE users SET password_hash = $1, force_password_change = false WHERE id = $2`,
        values: [hash, userId]
    }),
    adminUpdateUserPassword: (hash, id, ownerId) => ({
        text: `UPDATE users SET password_hash = $1, force_password_change = true WHERE id = $2 AND owner_id = $3`,
        values: [hash, id, ownerId]
    }),
    getLoginHistory: (ownerId) => ({
        text: `SELECT s.ip_address, s.device_info, s.created_at, s.expires_at, s.invalidated_at, u.email as user_email
               FROM sessions s JOIN users u ON s.user_id = u.id
               WHERE u.owner_id = $1 OR u.id = $1 ORDER BY s.created_at DESC LIMIT 50`,
        values: [ownerId]
    }),

    // Admin & Club Config Queries
    getAdminClubName: (ownerId) => ({
        text: `SELECT club_name FROM admin_config WHERE owner_id = $1`,
        values: [ownerId]
    }),
    updateAdminClubName: (clubName, ownerId) => ({
        text: `UPDATE admin_config SET club_name = $1, updated_at = NOW() WHERE owner_id = $2`,
        values: [clubName, ownerId]
    }),
    getUserClubName: (ownerId) => ({
        text: `SELECT ac.club_name, u.email FROM admin_config ac JOIN users u ON u.id = ac.owner_id WHERE ac.owner_id = $1`,
        values: [ownerId]
    }),
    getAdminConfig: (ownerId) => ({
        text: `SELECT low_stock_threshold, setup_completed, default_shake_amount FROM admin_config WHERE owner_id = $1`,
        values: [ownerId]
    }),
    completeSetup: (ownerId) => ({
        text: `UPDATE admin_config SET setup_completed = true, updated_at = NOW() WHERE owner_id = $1`,
        values: [ownerId]
    }),
    updateAdminConfig: (shakeAmount, threshold, ownerId) => ({
        text: `UPDATE admin_config SET default_shake_amount = $1, low_stock_threshold = $2, updated_at = NOW() WHERE owner_id = $3`,
        values: [shakeAmount, threshold, ownerId]
    }),
};
