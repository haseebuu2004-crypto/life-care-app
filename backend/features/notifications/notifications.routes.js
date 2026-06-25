const express = require('express');
const router = express.Router();
const notificationController = require('./notifications.controller');
const { authenticateToken } = require('../../shared/middleware/authMiddleware');

router.get('/notifications', authenticateToken, notificationController.getNotifications);
router.get('/notifications/unread-count', authenticateToken, notificationController.getUnreadCount);
router.put('/notifications/:id/read', authenticateToken, notificationController.markAsRead);
router.put('/notifications/read', authenticateToken, notificationController.markAsRead);

module.exports = router;
