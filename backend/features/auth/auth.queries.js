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
    createSession: (userId, tokenHash, tenantId, expiresAt, ip, ua) => ({
        text: `INSERT INTO sessions (user_id, token_hash, tenant_id, expires_at, ip_address, device_info) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        values: [userId, tokenHash, tenantId, expiresAt, ip, ua]
    }),
    getSessionById: (sessionId) => ({
        text: `SELECT s.id as session_id, s.expires_at, u.id, u.email, u.role, u.owner_id, u.is_active, u.force_password_change 
               FROM sessions s 
               JOIN users u ON s.user_id = u.id 
               WHERE s.id = $1 AND s.expires_at > NOW() AND s.invalidated_at IS NULL`,
        values: [sessionId]
    }),
    getSessionByHash: (tokenHash) => ({
        text: `SELECT s.id as session_id, s.expires_at, u.id, u.email, u.role, u.owner_id, u.is_active, u.force_password_change 
               FROM sessions s 
               JOIN users u ON s.user_id = u.id 
               WHERE s.token_hash = $1 AND s.expires_at > NOW() AND s.invalidated_at IS NULL`,
        values: [tokenHash]
    }),
    invalidateSession: (sessionId) => ({
        text: `UPDATE sessions SET invalidated_at = NOW() WHERE id = $1`,
        values: [sessionId]
    }),
    invalidateSessionByHash: (tokenHash) => ({
        text: `UPDATE sessions SET invalidated_at = NOW() WHERE token_hash = $1`,
        values: [tokenHash]
    }),
    invalidateUserSessionById: (userId, sessionId) => ({
        text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND id = $2 AND invalidated_at IS NULL`,
        values: [userId, sessionId]
    }),
    invalidateAllSessions: (userId) => ({
        text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND invalidated_at IS NULL`,
        values: [userId]
    }),
    invalidateOtherSessions: (userId, tokenHash) => ({
        text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND token_hash != $2 AND invalidated_at IS NULL`,
        values: [userId, tokenHash]
    }),
    getActiveSessionsForUser: (userId) => ({
        text: `SELECT id, device_info, created_at, last_seen_at, ip_address FROM sessions WHERE user_id = $1 AND expires_at > NOW() AND invalidated_at IS NULL ORDER BY last_seen_at DESC`,
        values: [userId]
    }),
    evictOldestSessions: (userId, keepCount) => ({
        text: `UPDATE sessions SET invalidated_at = NOW() WHERE id IN (
                   SELECT id FROM sessions 
                   WHERE user_id = $1 AND expires_at > NOW() AND invalidated_at IS NULL 
                   ORDER BY last_seen_at DESC 
                   OFFSET $2
               )`,
        values: [userId, keepCount]
    }),

    // Password Reset
    invalidateOldPasswordResets: (userId) => ({
        text: `UPDATE password_resets SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`,
        values: [userId]
    }),
    createPasswordReset: (userId, tokenHash, expiresAt) => ({
        text: `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id`,
        values: [userId, tokenHash, expiresAt]
    }),
    getPasswordResetByHash: (tokenHash) => ({
        text: `SELECT * FROM password_resets WHERE token_hash = $1 ORDER BY created_at DESC LIMIT 1`,
        values: [tokenHash]
    }),
    consumePasswordReset: (tokenHash) => ({
        text: `UPDATE password_resets SET used_at = NOW() WHERE token_hash = $1`,
        values: [tokenHash]
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
        text: `UPDATE sessions SET last_seen_at = NOW() WHERE id = $1`,
        values: [sessionId]
    }),
    bumpSessionActivityByHash: (tokenHash) => ({
        text: `UPDATE sessions SET last_seen_at = NOW() WHERE token_hash = $1`,
        values: [tokenHash]
    })
};
