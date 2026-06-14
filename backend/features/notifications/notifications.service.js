const queries = require('./notifications.queries');

exports.createNotification = async (userId, type, title, body, data, sendEmail = false) => {
    try {
        const res = await queries.insertNotification(userId, type, title, body, JSON.stringify(data || {}));

        if (sendEmail && process.env.SMTP_USER) {
            const userRes = await queries.getUserEmail(userId);
            if (process.env.SMTP_USER) {
                if (process.env.EMAILJS_PUBLIC_KEY) {
                    try {
                        const emailjsRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                service_id: 'service_xw04039',
                                template_id: 'template_1a2mg5b',
                                user_id: process.env.EMAILJS_PUBLIC_KEY,
                                accessToken: process.env.EMAILJS_PRIVATE_KEY,
                                template_params: {
                                    to_email: userRes.rows[0].email,
                                    subject: title,
                                    message: body
                                }
                            })
                        });
                        if (!emailjsRes.ok) {
                            console.error("EmailJS Notification failed:", await emailjsRes.text());
                        }
                    } catch (emailErr) {
                        console.error('Failed to send notification via EmailJS:', emailErr);
                    }
                } else {
                    console.error('EMAILJS_PUBLIC_KEY not configured, cannot send notification.');
                }
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
