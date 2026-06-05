const db = require('../db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const audit = require('../services/auditLogService');

// Generate 16-char random hex password
const generateTempPassword = () => crypto.randomBytes(8).toString('hex');

exports.getAppStats = async (req, res) => {
    try {
        const totalAdminsRes = await db.query(`SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = true`);
        const totalUsersRes = await db.query(`SELECT COUNT(*) FROM users WHERE role = 'user' AND is_active = true`);
        const activeSessionsRes = await db.query(`
            SELECT COUNT(DISTINCT user_id) 
            FROM sessions 
            WHERE expires_at > NOW() AND invalidated_at IS NULL AND last_activity_at > NOW() - INTERVAL '1 day'
        `);

        res.json({ 
            success: true, 
            stats: { 
                total_admins: parseInt(totalAdminsRes.rows[0].count), 
                total_users: parseInt(totalUsersRes.rows[0].count), 
                active_users: parseInt(activeSessionsRes.rows[0].count) 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getLiveSessions = async (req, res) => {
    try {
        const sessionsRes = await db.query(`
            SELECT s.id, s.ip_address, s.device_info, s.created_at, s.expires_at, s.invalidated_at, s.last_activity_at, u.email, u.role
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE u.role != 'master'
            ORDER BY s.last_activity_at DESC
        `);

        const formatted = sessionsRes.rows.map(s => {
            let status = 'Ended';
            
            if (!s.invalidated_at && new Date(s.expires_at) > new Date()) {
                const ageMins = (Date.now() - new Date(s.last_activity_at).getTime()) / 60000;
                status = ageMins < 5 ? 'Online' : 'Idle';
            }

            return {
                id: s.id,
                email: s.email,
                role: s.role,
                ipAddress: s.ip_address,
                device: s.device_info,
                loginTime: s.created_at,
                lastActivity: s.last_activity_at,
                status
            };
        });

        res.json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getActivityLog = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT a.id, a.action, a.table_name, a.created_at, u.email as actor_email, u.role as actor_role
            FROM audit_log a
            JOIN users u ON a.actor_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 500
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getUsers = async (req, res) => {
    try {
        // Fetch admins (and their subordinate users recursively via json_agg)
        const usersRes = await db.query(`
            SELECT 
                u.id, u.email, u.role, u.is_active, u.created_at, u.last_login_at,
                u.force_password_change,
                ac.club_name,
                (SELECT COUNT(*) FROM users sub WHERE sub.owner_id = u.id AND sub.role = 'user' AND sub.is_active = true) as user_count,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', sub.id, 
                                'email', sub.email, 
                                'role', sub.role,
                                'is_active', sub.is_active, 
                                'created_at', sub.created_at, 
                                'last_login_at', sub.last_login_at
                            )
                        ) 
                        FROM users sub 
                        WHERE sub.owner_id = u.id AND sub.role = 'user'
                    ), 
                    '[]'::json
                ) as users
            FROM users u 
            LEFT JOIN admin_config ac ON ac.owner_id = u.id
            WHERE u.role = 'admin' 
            ORDER BY u.created_at DESC
        `);
        res.json({ success: true, data: usersRes.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.createClubAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email required" });

        const normalizedEmail = email.trim().toLowerCase();
        
        const existCheck = await db.query(`SELECT id FROM users WHERE email = $1`, [normalizedEmail]);
        if (existCheck.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        const tempPassword = generateTempPassword();
        const hash = await bcrypt.hash(tempPassword, 12);

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Note: owner_id is set to the admin's OWN ID to maintain multi-tenant data isolation.
            // If owner_id was master.id, all admins would share the same products, stock, and sales!
            const userRes = await client.query(`
                INSERT INTO users (email, password_hash, role, owner_id, force_password_change, created_by)
                VALUES ($1, $2, 'admin', null, true, $3)
                RETURNING id
            `, [normalizedEmail, hash, req.user.id]);
            
            const newUserId = userRes.rows[0].id;
            
            await client.query(`UPDATE users SET owner_id = $1 WHERE id = $1`, [newUserId]);
            await client.query(`INSERT INTO admin_config (owner_id) VALUES ($1)`, [newUserId]);

            await client.query('COMMIT');
            await audit.logAction(req.user.id, 'ADMIN_CREATE', 'users', newUserId);

            res.json({ 
                success: true, 
                message: "Admin created successfully.", 
                tempPassword: tempPassword 
            });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ success: false, message: "Server error" });
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.forceResetAdminPassword = async (req, res) => {
    try {
        const { id } = req.params;
        
        const userCheck = await db.query(`SELECT role FROM users WHERE id = $1 AND is_active = true`, [id]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role === 'master') {
            return res.status(404).json({ success: false, message: "User not found or invalid" });
        }

        const tempPassword = generateTempPassword();
        const hash = await bcrypt.hash(tempPassword, 12);

        await db.query(`
            UPDATE users 
            SET password_hash = $1, force_password_change = true, failed_login_count = 0, locked_until = NULL 
            WHERE id = $2
        `, [hash, id]);
        
        // Invalidate sessions immediately
        await db.query(`UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND invalidated_at IS NULL`, [id]);

        await audit.logAction(req.user.id, 'ADMIN_FORCE_RESET', 'users', id);

        res.json({ success: true, message: "Password reset", tempPassword });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteClubAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Soft delete the admin and their subordinate users
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            const updateRes = await client.query(`
                UPDATE users SET is_active = false 
                WHERE (id = $1 OR owner_id = $1) AND role != 'master'
            `, [id]);
            
            if (updateRes.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: "User not found" });
            }
            
            // Invalidate sessions
            await client.query(`
                UPDATE sessions SET invalidated_at = NOW() 
                WHERE user_id IN (SELECT id FROM users WHERE id = $1 OR owner_id = $1)
                  AND invalidated_at IS NULL
            `, [id]);

            await client.query('COMMIT');
            
            await audit.logAction(req.user.id, 'ADMIN_DELETE', 'users', id);

            res.json({ success: true, message: "Admin and their users permanently deactivated." });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ success: false, message: "Server error" });
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.toggleAdminStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userCheck = await db.query(`SELECT is_active, role FROM users WHERE id = $1`, [id]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role === 'master') {
            return res.status(404).json({ success: false, message: "User not found or invalid" });
        }
        
        const newStatus = !userCheck.rows[0].is_active;
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`UPDATE users SET is_active = $1 WHERE id = $2 OR owner_id = $2`, [newStatus, id]);
            
            if (!newStatus) {
                await client.query(`UPDATE sessions SET invalidated_at = NOW() WHERE user_id IN (SELECT id FROM users WHERE id = $1 OR owner_id = $1) AND invalidated_at IS NULL`, [id]);
            }
            
            await client.query('COMMIT');
            
            await audit.logAction(req.user.id, newStatus ? 'ADMIN_ACTIVATE' : 'ADMIN_DEACTIVATE', 'users', id);
            
            res.json({ success: true, message: `Admin ${newStatus ? 'activated' : 'deactivated'}` });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ success: false, message: "Server error" });
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateAdminClubNameMaster = async (req, res) => {
    try {
        const adminId = req.params.id;
        let { club_name } = req.body;
        
        if (!club_name || club_name.trim().length === 0) {
            return res.status(400).json({ error: { message: "Club name must be between 1 and 100 characters." } });
        }
        
        club_name = club_name.trim();
        
        if (club_name.length > 100) {
            return res.status(400).json({ error: { message: "Club name must be between 1 and 100 characters." } });
        }

        const adminCheck = await db.query(`SELECT id FROM users WHERE id = $1 AND role = 'admin'`, [adminId]);
        if (adminCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        await db.query(`
            UPDATE admin_config SET club_name = $1, updated_at = NOW() WHERE owner_id = $2
        `, [club_name, adminId]);
        
        await audit.logAction(req.user.id, 'CLUB_NAME_UPDATE_BY_MASTER', 'admin_config', adminId, null, { club_name });
        
        res.json({ success: true, club_name });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
