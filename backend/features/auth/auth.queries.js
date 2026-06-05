module.exports = {
    // User Lookup
    getUserByEmail: (email) => ({
        text: `SELECT * FROM users WHERE email = $1`,
        values: [email]
    }),
    getUserById: (id) => ({
        text: `SELECT * FROM users WHERE id = $1`,
        values: [id]
    }),

    // Lockout
    updateFailedLogin: (newFails, lockedUntil, userId) => ({
        text: `UPDATE users SET failed_login_count = $1, locked_until = $2 WHERE id = $3`,
        values: [newFails, lockedUntil, userId]
    }),
    updateSuccessLogin: (userId) => ({
        text: `UPDATE users SET failed_login_count = 0, locked_until = NULL, last_login_at = NOW() WHERE id = $1`,
        values: [userId]
    }),

    // Sessions
    createSession: (userId, expiresAt, ip, ua) => ({
        text: `INSERT INTO sessions (user_id, expires_at, ip_address, device_info) VALUES ($1, $2, $3, $4) RETURNING id`,
        values: [userId, expiresAt, ip, ua]
    }),
    getSessionById: (sessionId) => ({
        text: `SELECT s.id as session_id, s.expires_at, u.id, u.email, u.role, u.owner_id, u.is_active, u.force_password_change 
               FROM sessions s 
               JOIN users u ON s.user_id = u.id 
               WHERE s.id = $1 AND s.expires_at > NOW() AND s.invalidated_at IS NULL`,
        values: [sessionId]
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

    // Password Reset
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

    // Passwords
    getPasswordHash: (userId) => ({
        text: `SELECT password_hash FROM users WHERE id = $1`,
        values: [userId]
    }),
    updateUserPassword: (hash, userId) => ({
        text: `UPDATE users SET password_hash = $1, force_password_change = false WHERE id = $2`,
        values: [hash, userId]
    }),

    // Device Detection
    checkPreviousSession: (userId, ip, ua, sessionId) => ({
        text: `SELECT id FROM sessions WHERE user_id = $1 AND ip_address = $2 AND device_info = $3 AND id != $4 AND created_at > NOW() - INTERVAL '30 days' LIMIT 1`,
        values: [userId, ip, ua, sessionId]
    }),

    // Middleware Utilities
    bumpSessionActivity: (sessionId) => ({
        text: `UPDATE sessions SET last_activity_at = NOW() WHERE id = $1`,
        values: [sessionId]
    })
};
