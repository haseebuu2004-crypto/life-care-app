const db = require('../db');
const nodemailer = require('nodemailer');

// Set up simple mail transport (can be updated with real creds later)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

exports.createNotification = async (userId, type, title, body, data, sendEmail = false) => {
    try {
        const res = await db.query(`
            INSERT INTO notifications (user_id, type, title, body, data)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, created_at
        `, [userId, type, title, body, JSON.stringify(data || {})]);

        if (sendEmail && process.env.SMTP_USER) {
            const userRes = await db.query(`SELECT email FROM users WHERE id = $1`, [userId]);
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
    const res = await db.query(`
        SELECT * FROM notifications 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
    `, [userId, limit]);
    return res.rows;
};

exports.markAsRead = async (userId, notificationId) => {
    if (notificationId) {
        await db.query(`
            UPDATE notifications SET read_at = NOW() 
            WHERE user_id = $1 AND id = $2 AND read_at IS NULL
        `, [userId, notificationId]);
    } else {
        await db.query(`
            UPDATE notifications SET read_at = NOW() 
            WHERE user_id = $1 AND read_at IS NULL
        `, [userId]);
    }
};

exports.getUnreadCount = async (userId) => {
    const res = await db.query(`
        SELECT COUNT(*) as count FROM notifications 
        WHERE user_id = $1 AND read_at IS NULL
    `, [userId]);
    return parseInt(res.rows[0].count);
};
