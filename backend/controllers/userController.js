const bcrypt = require('bcryptjs');
const pool = require('../config/db');

exports.getUsers = async (req, res) => {
    try {
        const ownerId = require('../middleware/authMiddleware').getOwnerId(req);
        const { rows } = await pool.query('SELECT id, username, role, email, auth_provider FROM users WHERE owner_id = $1 ORDER BY id ASC', [ownerId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const validRoles = ['admin', 'user'];
        if (!username || !password || !role) return res.status(400).json({ success: false, message: "username, password and role are required" });
        if (!validRoles.includes(role)) return res.status(400).json({ success: false, message: "Invalid role" });

        const hash = bcrypt.hashSync(password, 8);
        try {
            const ownerId = require('../middleware/authMiddleware').getOwnerId(req);
            const { rows } = await pool.query(
                'INSERT INTO users (username, password, role, owner_id) VALUES ($1, $2, $3, $4) RETURNING id', 
                [username, hash, role, ownerId]
            );
            res.json({ success: true, data: { id: rows[0].id, username, role } });
        } catch (err) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['admin', 'user'];
        if (!validRoles.includes(role)) return res.status(400).json({ success: false, message: "Invalid role" });

        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ success: false, message: "Cannot change your own role" });
        }

        await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
        res.json({ success: true, data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ success: false, message: "Cannot delete yourself" });
        }
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ success: true, data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
