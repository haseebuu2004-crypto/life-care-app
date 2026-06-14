const queries = require('./notifications.queries');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/["']/g, "").replace(/\s/g, "") : ""
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
});

exports.createNotification = async (userId, type, title, body, data, sendEmail = false) => {
    try {
        const res = await queries.insertNotification(userId, type, title, body, JSON.stringify(data || {}));

        if (sendEmail && process.env.SMTP_USER) {
            const userRes = await queries.getUserEmail(userId);
            if (userRes.rows.length > 0) {
                await transporter.sendMail({
                    from: '"Life Care System" <noreply@lifecare.com>',
                    to: userRes.rows[0].email,
                    subject: title,
                    text: body
                });
            }
        }
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
