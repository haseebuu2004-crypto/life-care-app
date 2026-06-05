const settingsService = require('./settings.service');

// ---------------------------------------------------------
// AUTHENTICATION & LOGIN FLOW
// ---------------------------------------------------------
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
        const ua = req.headers['user-agent'] || '';

        const { sessionId, user } = await settingsService.login(email, password, ip, ua);

        res.cookie('session_token', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 8 * 3600000
        });

        res.json({ 
            success: true,
            role: user.role,
            user: { id: user.id, email: user.email, role: user.role, forcePasswordChange: user.force_password_change } 
        });
    } catch (error) {
        if (error.message.includes("Invalid credentials") || error.message.includes("Invalid email") || error.message.includes("deactivated") || error.message.includes("Account locked")) {
            const status = error.message.includes("deactivated") || error.message.includes("Account locked") ? 403 : 401;
            return res.status(status).json({ success: false, message: error.message });
        }
        console.error("Login Route Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.logout = async (req, res) => {
    try {
        const sessionId = req.cookies?.session_token;
        await settingsService.logout(sessionId, req.user?.id);
        res.clearCookie('session_token');
        res.json({ success: true, message: "Logged out" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Logout error" });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, oldPassword } = req.body;
        // Handle both authController and userController body formats
        const currPwd = currentPassword || oldPassword;
        const newPwd = newPassword;

        await settingsService.changePassword(req.user.id, currPwd, newPwd, req.user.force_password_change, req.cookies?.session_token);
        
        // Re-login essentially if triggered via authController (i.e. force_password_change)
        // If force_password_change is false, it's just a regular password update and we might not need to set cookie,
        // but it doesn't hurt.
        if (req.user.force_password_change) {
            const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
            const ua = req.headers['user-agent'] || '';
            const sessionId = await settingsService.createNewSession(req.user.id, ip, ua);
            res.cookie('session_token', sessionId, { httpOnly: true, sameSite: 'lax', maxAge: 8 * 3600000 });
        }

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        if (error.message.includes("least 8 characters") || error.message.includes("required") || error.message.includes("Incorrect") || error.message.includes("Invalid")) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Change Password Error:", error);
        res.status(500).json({ success: false, message: "Failed to update password" });
    }
};

exports.getSession = (req, res) => {
    res.json({ 
        success: true, 
        user: { 
            id: req.user.id, 
            email: req.user.email, 
            role: req.user.role, 
            forcePasswordChange: req.user.force_password_change 
        } 
    });
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email required" });

        // Generic success message to prevent email enumeration
        res.json({ success: true, message: "If that email exists, reset instructions have been sent." });

        await settingsService.forgotPassword(email);
    } catch (error) {
        console.error("Forgot Password Error:", error);
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        await settingsService.resetPassword(token, newPassword);
        res.json({ success: true, message: "Password has been reset successfully. You can now log in." });
    } catch (error) {
        if (error.message.includes("Invalid")) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

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

// ---------------------------------------------------------
// MASTER ADMIN PROVISIONING & TIER 1
// ---------------------------------------------------------
exports.getAppStats = async (req, res) => {
    try {
        const stats = await settingsService.getMasterAppStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getLiveSessions = async (req, res) => {
    try {
        const data = await settingsService.getMasterLiveSessions();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getActivityLog = async (req, res) => {
    try {
        const data = await settingsService.getMasterActivityLog();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getMasterAdmins = async (req, res) => {
    try {
        const data = await settingsService.getMasterAdmins();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.createClubAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email required" });
        const tempPassword = await settingsService.createClubAdmin(email, req.user.id);
        res.json({ success: true, message: "Admin created successfully.", tempPassword });
    } catch (error) {
        if (error.message.includes("Email already exists")) return res.status(400).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.forceResetAdminPassword = async (req, res) => {
    try {
        const tempPassword = await settingsService.forceResetAdminPassword(req.params.id, req.user.id);
        res.json({ success: true, message: "Password reset", tempPassword });
    } catch (error) {
        if (error.message.includes("not found")) return res.status(404).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.toggleAdminStatus = async (req, res) => {
    try {
        const newStatus = await settingsService.toggleAdminStatus(req.params.id, req.user.id);
        res.json({ success: true, message: `Admin ${newStatus ? 'activated' : 'deactivated'}` });
    } catch (error) {
        if (error.message.includes("not found")) return res.status(404).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateAdminClubNameMaster = async (req, res) => {
    try {
        let { club_name } = req.body;
        if (!club_name || club_name.trim().length === 0 || club_name.trim().length > 100) {
            return res.status(400).json({ error: { message: "Club name must be between 1 and 100 characters." } });
        }
        await settingsService.updateAdminClubNameMaster(club_name.trim(), req.params.id, req.user.id);
        res.json({ success: true, club_name: club_name.trim() });
    } catch (error) {
        if (error.message.includes("not found")) return res.status(404).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteClubAdmin = async (req, res) => {
    try {
        await settingsService.deleteClubAdmin(req.params.id, req.user.id);
        res.json({ success: true, message: "Admin and their users permanently deactivated." });
    } catch (error) {
        if (error.message.includes("not found")) return res.status(404).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: "Server error" });
    }
};
