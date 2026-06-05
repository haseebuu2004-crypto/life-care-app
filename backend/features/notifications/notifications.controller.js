const notificationService = require('./notifications.service');

exports.getNotifications = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id; // Target user is admin (owner) or user themselves
        // Notifications are tied to the user ID. For users, they only see their own. 
        // For admin, they see admin notifications.
        const notifications = await notificationService.getNotifications(req.user.id, 50);
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id; // Optional
        await notificationService.markAsRead(req.user.id, notificationId);
        res.json({ success: true, message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user.id);
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
