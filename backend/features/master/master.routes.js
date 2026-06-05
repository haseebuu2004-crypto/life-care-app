const express = require('express');
const router = express.Router();
const masterController = require('./master.controller');
const { authenticateToken, requireMaster } = require('../../shared/middleware/authMiddleware');

// ---------------------------------------------------------
// MASTER TIER (TIER 1) - PREFIXED
// ---------------------------------------------------------
router.get('/stats', authenticateToken, requireMaster, masterController.getAppStats);
router.get('/sessions', authenticateToken, requireMaster, masterController.getLiveSessions);
router.get('/audit-log', authenticateToken, requireMaster, masterController.getActivityLog);
router.get('/admins', authenticateToken, requireMaster, masterController.getMasterAdmins);
router.post('/admins', authenticateToken, requireMaster, masterController.createClubAdmin);
router.post('/admins/:id/reset-password', authenticateToken, requireMaster, masterController.forceResetAdminPassword);
router.put('/admins/:id/toggle-status', authenticateToken, requireMaster, masterController.toggleAdminStatus);
router.put('/admins/:id/club-name', authenticateToken, requireMaster, masterController.updateAdminClubNameMaster);
router.delete('/admins/:id', authenticateToken, requireMaster, masterController.deleteClubAdmin);

module.exports = router;
