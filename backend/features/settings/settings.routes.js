const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');
const { authenticateToken, requireAdmin, requireMaster } = require('../../shared/middleware/authMiddleware');
const validate = require('../../shared/middleware/validate');

// ---------------------------------------------------------
// DASHBOARD & CONFIGURATION SETTINGS
// ---------------------------------------------------------
router.get('/admin/club-name', authenticateToken, requireAdmin, settingsController.getAdminClubName);
router.put('/admin/club-name', authenticateToken, requireAdmin, settingsController.updateAdminClubName);
router.get('/user/club-name', authenticateToken, settingsController.getUserClubName);
router.put('/admin/config/setup-complete', authenticateToken, requireAdmin, settingsController.completeSetup);
router.put('/settings/config', authenticateToken, requireAdmin, settingsController.updateAdminConfig);

// ---------------------------------------------------------
// USER MANAGEMENT
// ---------------------------------------------------------

router.get('/users', authenticateToken, requireAdmin, settingsController.getUsers);
router.post('/users', authenticateToken, requireAdmin, settingsController.createUser);
router.put('/users/:id/role', authenticateToken, requireAdmin, settingsController.updateUserRole);
router.post('/users/:id/reset-password', authenticateToken, requireAdmin, settingsController.adminUpdateUserPassword);
router.delete('/users/:id', authenticateToken, requireAdmin, settingsController.deleteUser);
router.get('/login-history', authenticateToken, requireAdmin, settingsController.getLoginHistory);

module.exports = router;
