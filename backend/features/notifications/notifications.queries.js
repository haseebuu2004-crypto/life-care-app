const db = require('../../shared/db/connection');

exports.insertNotification = (userId, type, title, body, dataStr) => {
    return db.query(`
        INSERT INTO notifications (user_id, type, title, body, data)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, created_at
    `, [userId, type, title, body, dataStr]);
};

exports.getUserEmail = (userId) => {
    return db.query(`SELECT email FROM users WHERE id = $1`, [userId]);
};

exports.fetchNotifications = (userId, limit) => {
    return db.query(`
        SELECT * FROM notifications 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
    `, [userId, limit]);
};

exports.updateSingleReadStatus = (userId, notificationId) => {
    return db.query(`
        UPDATE notifications SET read_at = NOW() 
        WHERE user_id = $1 AND id = $2 AND read_at IS NULL
    `, [userId, notificationId]);
};

exports.updateAllReadStatus = (userId) => {
    return db.query(`
        UPDATE notifications SET read_at = NOW() 
        WHERE user_id = $1 AND read_at IS NULL
    `, [userId]);
};

exports.countUnread = (userId) => {
    return db.query(`
        SELECT COUNT(*) as count FROM notifications 
        WHERE user_id = $1 AND read_at IS NULL
    `, [userId]);
};
