const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validate');
const { loginSchema } = require('../../schemas/apiSchemas');
const { loginLimiter, passwordResetLimiter } = require('../../middleware/rateLimiters');

// ---------------------------------------------------------
// AUTHENTICATION & LOGIN FLOW
// ---------------------------------------------------------
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);
router.post('/change-password', authenticateToken, authController.changePassword);
router.get('/session', authenticateToken, authController.getSession);

module.exports = router;
