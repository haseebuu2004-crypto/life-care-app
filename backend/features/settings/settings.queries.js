module.exports = {
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
