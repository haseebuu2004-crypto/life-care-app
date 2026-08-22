const queries = require('./notifications.queries');

exports.createNotification = async (userId, type, title, body, data, sendEmail = false) => {
    try {
        const res = await queries.insertNotification(userId, type, title, body, JSON.stringify(data || {}));

        return res.rows[0];
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
};

exports.getNotifications = async (userId, limit = 50) => {
    const res = await queries.fetchNotifications(userId, limit);
    return res.rows;
};

exports.markAsRead = async (userId, notificationId) => {
    if (notificationId) {
        await queries.updateSingleReadStatus(userId, notificationId);
    } else {
        await queries.updateAllReadStatus(userId);
    }
};

exports.getUnreadCount = async (userId) => {
    const res = await queries.countUnread(userId);
    return parseInt(res.rows[0].count);
};
