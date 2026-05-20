const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.getUsers = (req, res) => {
    try {
        db.all('SELECT id, username, role FROM users ORDER BY id ASC', [], (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: rows });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createUser = (req, res) => {
    try {
        const { username, password, role } = req.body;
        const validRoles = ['admin', 'user'];
        if (!username || !password || !role) return res.status(400).json({ success: false, message: "username, password and role are required" });
        if (!validRoles.includes(role)) return res.status(400).json({ success: false, message: "Invalid role" });

        const hash = bcrypt.hashSync(password, 8);
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role], function(err) {
            if (err) return res.status(400).json({ success: false, message: "Username already exists" });
            res.json({ success: true, data: { id: this.lastID, username, role } });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserRole = (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['admin', 'user'];
        if (!validRoles.includes(role)) return res.status(400).json({ success: false, message: "Invalid role" });

        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ success: false, message: "Cannot change your own role" });
        }

        db.run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id], function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: null });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = (req, res) => {
    try {
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ success: false, message: "Cannot delete yourself" });
        }
        db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: null });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
