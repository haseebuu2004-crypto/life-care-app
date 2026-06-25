const masterService = require('./master.service');

// ---------------------------------------------------------
// MASTER ADMIN PROVISIONING & TIER 1
// ---------------------------------------------------------
exports.getAppStats = async (req, res) => {
    try {
        const stats = await masterService.getAppStats();
        res.json({ success: true, stats });
    } catch (error) {
        console.error("master.controller.getAppStats ERROR:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getLiveSessions = async (req, res) => {
    try {
        const data = await masterService.getLiveSessions();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getActivityLog = async (req, res) => {
    try {
        const data = await masterService.getActivityLog();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getMasterAdmins = async (req, res) => {
    try {
        const data = await masterService.getMasterAdmins();
        res.json({ success: true, data });
    } catch (error) {
        console.error("master.controller.getMasterAdmins ERROR:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.createClubAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email required" });
        const tempPassword = await masterService.createClubAdmin(email, req.user.id);
        res.json({ success: true, message: "Admin created successfully.", tempPassword });
    } catch (error) {
        if (error.message.includes("Email already exists")) return res.status(400).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.forceResetAdminPassword = async (req, res) => {
    try {
        const tempPassword = await masterService.forceResetAdminPassword(req.params.id, req.user.id);
        res.json({ success: true, message: "Password reset", tempPassword });
    } catch (error) {
        if (error.message.includes("not found")) return res.status(404).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.toggleAdminStatus = async (req, res) => {
    try {
        const newStatus = await masterService.toggleAdminStatus(req.params.id, req.user.id);
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
        await masterService.updateAdminClubNameMaster(club_name.trim(), req.params.id, req.user.id);
        res.json({ success: true, club_name: club_name.trim() });
    } catch (error) {
        if (error.message.includes("not found")) return res.status(404).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteClubAdmin = async (req, res) => {
    try {
        await masterService.deleteClubAdmin(req.params.id, req.user.id);
        res.json({ success: true, message: "Admin and their users permanently deactivated." });
    } catch (error) {
        if (error.message.includes("not found")) return res.status(404).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: "Server error" });
    }
};
