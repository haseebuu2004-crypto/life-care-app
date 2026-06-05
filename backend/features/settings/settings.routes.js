const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');
const { authenticateToken, requireAdmin, requireMaster } = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validate');
const { loginSchema } = require('../../schemas/apiSchemas');
const { loginLimiter, passwordResetLimiter } = require('../../middleware/rateLimiters');

// ---------------------------------------------------------
// AUTHENTICATION & LOGIN FLOW
// ---------------------------------------------------------
router.post('/auth/login', loginLimiter, validate(loginSchema), settingsController.login);
router.post('/auth/logout', settingsController.logout);
router.post('/auth/forgot-password', passwordResetLimiter, settingsController.forgotPassword);
router.post('/auth/reset-password', passwordResetLimiter, settingsController.resetPassword);
router.post('/auth/change-password', authenticateToken, settingsController.changePassword);
router.get('/auth/session', authenticateToken, settingsController.getSession);



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
router.put('/users/me/password', authenticateToken, settingsController.changePassword); // Alias mapping to changePassword
router.get('/users', authenticateToken, requireAdmin, settingsController.getUsers);
router.post('/users', authenticateToken, requireAdmin, settingsController.createUser);
router.put('/users/:id/role', authenticateToken, requireAdmin, settingsController.updateUserRole);
router.post('/users/:id/reset-password', authenticateToken, requireAdmin, settingsController.adminUpdateUserPassword);
router.delete('/users/:id', authenticateToken, requireAdmin, settingsController.deleteUser);
router.get('/login-history', authenticateToken, requireAdmin, settingsController.getLoginHistory);

module.exports = router;
