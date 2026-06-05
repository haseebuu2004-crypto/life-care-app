const settingsService = require('./settings.service');



// ---------------------------------------------------------
// STANDARD USER MANAGEMENT
// ---------------------------------------------------------
exports.getUsers = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const users = await settingsService.getUsers(ownerId);
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, password, email, role } = req.body;
        const targetRole = role || 'user';
        const validRoles = ['admin', 'user'];
        if (!validRoles.includes(targetRole)) return res.status(400).json({ success: false, message: "Invalid role" });
        
        if (req.user.role === 'admin' && targetRole !== 'user') {
            return res.status(403).json({ success: false, message: "Admins can only create standard users" });
        }

        const ownerId = req.user.owner_id || req.user.id;
        const { tempPassword, user } = await settingsService.createUser(username, password, email, targetRole, req.user.id, ownerId);

        res.json({ success: true, tempPassword, data: user });
    } catch (error) {
        if (error.message.includes("Email already registered")) return res.status(400).json({ success: false, message: "Email already registered" });
        if (error.message.includes("Email is already registered in another club") || error.message.includes("only add 2 staff")) {
            return res.status(403).json({ success: false, message: error.message });
        }
        if (error.message.includes("required")) return res.status(400).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['admin', 'user'].includes(role)) return res.status(400).json({ success: false, message: "Invalid role" });
        if (req.params.id === req.user.id) return res.status(400).json({ success: false, message: "Cannot change your own role" });
        if (req.user.role === 'admin' && role !== 'user') return res.status(403).json({ success: false, message: "Admins can only assign standard user roles" });

        const ownerId = req.user.owner_id || req.user.id;
        await settingsService.updateUserRole(role, req.params.id, ownerId);
        res.json({ success: true, data: null });
    } catch (error) {
        if (error.message === "User not found") return res.status(404).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) return res.status(400).json({ success: false, message: "Cannot delete yourself" });
        const ownerId = req.user.owner_id || req.user.id;
        await settingsService.deleteUser(req.params.id, req.user.id, ownerId);
        res.json({ success: true, data: null });
    } catch (error) {
        if (error.message === "User not found") return res.status(404).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.adminUpdateUserPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const ownerId = req.user.owner_id || req.user.id;
        await settingsService.adminUpdateUserPassword(newPassword, req.params.id, req.user.id, ownerId);
        res.json({ success: true, message: "Password updated for user and force change requested." });
    } catch (error) {
        if (error.message.includes("least 8 characters")) return res.status(400).json({ success: false, message: error.message });
        if (error.message.includes("not found")) return res.status(404).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLoginHistory = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const data = await settingsService.getLoginHistory(ownerId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------------------------------------------
// DASHBOARD & CONFIGURATION SETTINGS
// ---------------------------------------------------------
exports.getAdminClubName = async (req, res) => {
    try {
        const name = await settingsService.getAdminClubName(req.user.id);
        res.json({ success: true, club_name: name });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAdminClubName = async (req, res) => {
    try {
        let { club_name } = req.body;
        if (!club_name || club_name.trim().length === 0 || club_name.trim().length > 100) {
            return res.status(400).json({ error: { message: "Club name must be between 1 and 100 characters." } });
        }
        await settingsService.updateAdminClubName(club_name.trim(), req.user.id, req.user.id);
        res.json({ success: true, club_name: club_name.trim(), message: "Club name updated successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserClubName = async (req, res) => {
    try {
        const name = await settingsService.getUserClubName(req.user.owner_id);
        res.json({ success: true, club_name: name });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.completeSetup = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        await settingsService.completeSetup(ownerId, req.user.id);
        res.json({ success: true, message: "Setup completed." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update setup status" });
    }
};

exports.updateAdminConfig = async (req, res) => {
    try {
        const { default_shake_amount, low_stock_threshold } = req.body;
        if (default_shake_amount === undefined && low_stock_threshold === undefined) {
            return res.status(400).json({ success: false, message: "Invalid configuration values" });
        }
        const ownerId = req.user.owner_id || req.user.id;
        await settingsService.updateAdminConfig(default_shake_amount, low_stock_threshold, ownerId, req.user.id);
        res.json({ success: true, message: "Configuration updated successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update configuration." });
    }
};


