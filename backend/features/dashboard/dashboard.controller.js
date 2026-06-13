const dashboardService = require('./dashboard.service');

exports.getStats = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        let { startDate, endDate } = req.query;
        
        const now = new Date();
        if (!startDate) {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CA');
        }
        if (!endDate) {
            endDate = now.toLocaleDateString('en-CA');
        }

        const result = await dashboardService.getStats(ownerId, startDate, endDate);
        
        if (result.cached) {
            return res.json({ success: true, data: result.data, cached: true });
        }
        
        res.json({ success: true, data: result.data });
    } catch (error) {
        if (error.message && error.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.resetData = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        await dashboardService.resetData(ownerId, req.user.id);
        res.json({ success: true, message: "Sales and Attendance data reset successfully (Stock restored)" });
    } catch (error) {
        console.error("Reset Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        if (req.user.id !== (req.user.owner_id || req.user.id)) {
            return res.status(403).json({ success: false, message: "Only the primary account holder can delete the account." });
        }
        const ownerId = req.user.id;
        await dashboardService.deleteAccount(ownerId);
        
        res.clearCookie('session_token');
        res.json({ success: true, message: "Account deleted." });
    } catch (error) {
        console.error("Delete Account Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.completeSetup = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        await dashboardService.completeSetup(ownerId);
        res.json({ success: true, message: "Setup wizard completed" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateAdminConfig = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { default_shake_amount, low_stock_threshold } = req.body;
        
        await dashboardService.updateAdminConfig(ownerId, default_shake_amount, low_stock_threshold);
        res.json({ success: true, message: "Config updated successfully" });
    } catch (error) {
        console.error("Config Update Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.clearAttendanceData = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { month } = req.body;
        
        await dashboardService.clearAttendanceData(ownerId, req.user.id, month);
        res.json({ 
            success: true, 
            message: `Attendance data cleared successfully${month ? ` for ${month}` : ''}.` 
        });
    } catch (error) {
        console.error("Clear Attendance Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.clearSalesData = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { month } = req.body;
        
        await dashboardService.clearSalesData(ownerId, req.user.id, month);
        res.json({ 
            success: true, 
            message: `Sales data cleared successfully${month ? ` for ${month}` : ''}. Stock has been restored.` 
        });
    } catch (error) {
        console.error("Clear Sales Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.requestResetOtp = async (req, res) => {
    try {
        const { password } = req.body;
        const result = await dashboardService.requestResetOtp(req.user.id, req.user.email, password);
        return res.json({ success: true, message: result.message, expires_at: result.expiresAt, server_time: new Date().toISOString() });
    } catch (error) {
        if (error.message === "Password is required" || error.message === "Invalid confirmation phrase" || error.message.includes("OTP")) {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message === "User not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message === "Incorrect password") {
            return res.status(401).json({ success: false, message: error.message });
        }
        console.error("Request OTP error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.confirmReset = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { password, confirmText, otp, modules } = req.body;
        
        await dashboardService.confirmReset(ownerId, req.user.id, password, confirmText, otp, modules);
        res.json({ success: true, message: "Selected modules have been reset successfully." });
    } catch (error) {
        if (error.message.includes("required") || error.message.includes("confirmation") || error.message.includes("OTP")) {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message === "User not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message === "Incorrect password") {
            return res.status(401).json({ success: false, message: error.message });
        }
        console.error("Confirm Reset error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getDeletedRecords = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const combined = await dashboardService.getDeletedRecords(ownerId);
        res.json({ success: true, data: combined });
    } catch (error) {
        console.error("Get Deleted Records error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.restoreDeletedRecord = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { type, id } = req.params;
        
        await dashboardService.restoreDeletedRecord(ownerId, req.user.id, type, id);
        res.json({ success: true, message: "Record restored successfully." });
    } catch (error) {
        console.error("Restore Deleted Record error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
