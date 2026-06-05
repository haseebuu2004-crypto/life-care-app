const bcrypt = require('bcryptjs');
const db = require('../db');
const audit = require('../services/auditLogService');

exports.getUsers = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        
        // Expose users without password hashes
        const result = await db.query(`
            SELECT id, email as username, email, role, is_active, last_login_at 
            FROM users 
            WHERE owner_id = $1 AND is_active = true
            ORDER BY created_at DESC
        `, [ownerId]);
        
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        let { username, password, email, role } = req.body;
        const validRoles = ['admin', 'user'];
        const targetRole = role || 'user';
        
        // Auto-generate a password if not provided
        let tempPassword = null;
        if (!password) {
            tempPassword = require('crypto').randomBytes(4).toString('hex');
            password = tempPassword;
        }

        if (!targetRole) return res.status(400).json({ success: false, message: "role is required" });
        if (!validRoles.includes(targetRole)) return res.status(400).json({ success: false, message: "Invalid role" });
        
        const ownerId = req.user.owner_id || req.user.id;

        // Admins can only create standard users
        if (req.user.role === 'admin' && targetRole !== 'user') {
            return res.status(403).json({ success: false, message: "Admins can only create standard users" });
        }

        // Check limit: 2 users maximum per admin
        if (targetRole === 'user') {
            const countRes = await db.query(`SELECT COUNT(*) FROM users WHERE owner_id = $1 AND role = 'user' AND is_active = true`, [ownerId]);
            if (parseInt(countRes.rows[0].count) >= 2) {
                return res.status(403).json({ success: false, message: "You can only add 2 staff users." });
            }
        }

        // Default username from email if not provided
        if (!username && email) {
            username = email.split('@')[0];
        } else if (!username && !email) {
             return res.status(400).json({ success: false, message: "Email or username is required" });
        }

        const userEmail = email ? email.trim().toLowerCase() : `${username.replace(/\s+/g, '').toLowerCase()}@clubapp.local`;
        
        const existing = await db.query('SELECT id, is_active, owner_id FROM users WHERE email = $1', [userEmail]);
        if (existing.rows.length > 0) {
            if (existing.rows[0].is_active) {
                return res.status(400).json({ success: false, message: "Email already registered" }); // CHECK 15.1
            } else {
                if (existing.rows[0].owner_id !== ownerId) {
                    return res.status(403).json({ success: false, message: "Email is already registered in another club" });
                }
                const hash = await bcrypt.hash(password, 12);
                const updateRes = await db.query(`
                    UPDATE users SET is_active = true, password_hash = $1, role = $2, force_password_change = true, locked_until = NULL 
                    WHERE id = $3 RETURNING id, email, role
                `, [hash, targetRole, existing.rows[0].id]);
                
                await audit.logAction(req.user.id, 'USER_REACTIVATE', 'users', updateRes.rows[0].id);

                return res.json({ 
                    success: true, 
                    tempPassword: tempPassword,
                    data: { id: updateRes.rows[0].id, email: userEmail, role: targetRole } 
                });
            }
        }

        const hash = await bcrypt.hash(password, 12); // Cost 12 for security (CHECK 2.1)
        
        const newRes = await db.query(`
            INSERT INTO users (email, password_hash, role, owner_id, force_password_change, created_by)
            VALUES ($1, $2, $3, $4, true, $5) RETURNING id, email, role
        `, [userEmail, hash, targetRole, ownerId, req.user.id]);
        
        await audit.logAction(req.user.id, 'USER_CREATE', 'users', newRes.rows[0].id);

        res.json({ 
            success: true, 
            tempPassword: tempPassword,
            data: { id: newRes.rows[0].id, email: userEmail, role: targetRole } 
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation fallback
            return res.status(400).json({ success: false, message: "Email already registered" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['admin', 'user'];
        if (!validRoles.includes(role)) return res.status(400).json({ success: false, message: "Invalid role" });

        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: "Cannot change your own role" });
        }
        
        // Admins can only assign the standard user role
        if (req.user.role === 'admin' && role !== 'user') {
            return res.status(403).json({ success: false, message: "Admins can only assign standard user roles" });
        }

        const ownerId = req.user.owner_id || req.user.id;

        const updRes = await db.query(`
            UPDATE users SET role = $1 WHERE id = $2 AND owner_id = $3 RETURNING id
        `, [role, req.params.id, ownerId]);

        if (updRes.rowCount === 0) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: "Cannot delete yourself" });
        }
        
        const ownerId = req.user.owner_id || req.user.id;
        
        // Soft delete (CHECK 3.2)
        const delRes = await db.query(`
            UPDATE users SET is_active = false, locked_until = NOW() WHERE id = $1 AND owner_id = $2 RETURNING id
        `, [req.params.id, ownerId]);
        
        if (delRes.rowCount === 0) return res.status(404).json({ success: false, message: "User not found" });
        
        // Invalidate all their sessions
        await db.query(`UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND invalidated_at IS NULL`, [req.params.id]);

        await audit.logAction(req.user.id, 'USER_DELETE', 'users', req.params.id);

        res.json({ success: true, data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) return res.status(400).json({ success: false, message: "oldPassword and newPassword are required" });
        if (newPassword.length < 8) return res.status(400).json({ success: false, message: "New password must be at least 8 characters long" });

        const userRes = await db.query(`SELECT password_hash FROM users WHERE id = $1`, [req.user.id]);
        if (userRes.rowCount === 0) return res.status(404).json({ success: false, message: "User not found" });

        const validPassword = await bcrypt.compare(oldPassword, userRes.rows[0].password_hash);
        if (!validPassword) return res.status(401).json({ success: false, message: "Invalid old password" });

        const hash = await bcrypt.hash(newPassword, 12);
        
        await db.query(`
            UPDATE users SET password_hash = $1, force_password_change = false WHERE id = $2
        `, [hash, req.user.id]);
        
        // Invalidate ALL OTHER sessions on password change (CHECK 2.5)
        const sessionId = req.cookies?.session_token;
        if (sessionId) {
            await db.query(`
                UPDATE sessions SET invalidated_at = NOW() 
                WHERE user_id = $1 AND id != $2 AND invalidated_at IS NULL
            `, [req.user.id, sessionId]);
        }
        
        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.adminUpdateUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });

        const hash = await bcrypt.hash(newPassword, 12);
        
        const ownerId = req.user.owner_id || req.user.id;

        // Ensure the admin only modifies users within their club (CHECK 16.2)
        const result = await db.query(`
            UPDATE users SET password_hash = $1, force_password_change = true 
            WHERE id = $2 AND owner_id = $3
        `, [hash, id, ownerId]);

        if (result.rowCount === 0) return res.status(404).json({ success: false, message: "User not found or you don't have permission" });
        
        // Invalidate all their sessions
        await db.query(`UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND invalidated_at IS NULL`, [id]);

        await audit.logAction(req.user.id, 'USER_FORCE_PWD_CHANGE', 'users', id);

        res.json({ success: true, message: "Password updated for user and force change requested." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLoginHistory = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        
        const result = await db.query(`
            SELECT s.ip_address, s.device_info, s.created_at, s.expires_at, s.invalidated_at, u.email as user_email
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE u.owner_id = $1 OR u.id = $1
            ORDER BY s.created_at DESC
            LIMIT 50
        `, [ownerId]);
        
        const mapped = result.rows.map(r => {
            const ageMins = (Date.now() - new Date(r.created_at).getTime()) / 60000;
            let status = 'Ended';
            
            if (!r.invalidated_at && new Date(r.expires_at) > new Date()) {
                status = ageMins < 15 ? 'Online' : 'Idle';
            }

            return {
                ipAddress: r.ip_address,
                userAgent: r.device_info,
                loginTime: r.created_at,
                userEmail: r.user_email,
                status
            };
        });
        
        res.json({ success: true, data: mapped });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAdminClubName = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const result = await db.query(`SELECT club_name FROM admin_config WHERE owner_id = $1`, [ownerId]);
        res.json({ success: true, club_name: result.rows.length > 0 ? result.rows[0].club_name : null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAdminClubName = async (req, res) => {
    try {
        let { club_name } = req.body;
        
        if (!club_name || club_name.trim().length === 0) {
            return res.status(400).json({ error: { message: "Club name must be between 1 and 100 characters." } });
        }
        
        club_name = club_name.trim();
        
        if (club_name.length > 100) {
            return res.status(400).json({ error: { message: "Club name must be between 1 and 100 characters." } });
        }
        
        const ownerId = req.user.id;
        
        await db.query(`
            UPDATE admin_config SET club_name = $1, updated_at = NOW() WHERE owner_id = $2
        `, [club_name, ownerId]);
        
        await audit.logAction(req.user.id, 'CLUB_NAME_UPDATE', 'admin_config', ownerId, null, { club_name });
        
        res.json({ success: true, club_name, message: "Club name updated successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserClubName = async (req, res) => {
    try {
        const ownerId = req.user.owner_id;
        const result = await db.query(`
            SELECT ac.club_name, u.email
            FROM admin_config ac
            JOIN users u ON u.id = ac.owner_id
            WHERE ac.owner_id = $1
        `, [ownerId]);
        
        if (result.rows.length > 0) {
            const { club_name, email } = result.rows[0];
            const fallback = email ? email.split('@')[0] : 'Life Care';
            const display_name = (club_name && club_name.trim() !== '') ? club_name.trim() : fallback;
            return res.json({ success: true, club_name: display_name });
        }
        
        res.json({ success: true, club_name: 'Life Care' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
