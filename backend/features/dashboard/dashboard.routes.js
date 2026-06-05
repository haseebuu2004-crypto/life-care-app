const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authenticateToken, requireAdmin } = require('../../middleware/authMiddleware');

router.get('/dashboard/stats', authenticateToken, dashboardController.getStats);

// Data Management
router.post('/data-management/delete', authenticateToken, requireAdmin, dashboardController.resetData);
router.delete('/data-management/attendance', authenticateToken, requireAdmin, dashboardController.clearAttendanceData);
router.delete('/data-management/sales', authenticateToken, requireAdmin, dashboardController.clearSalesData);
router.get('/data-management/deleted', authenticateToken, requireAdmin, dashboardController.getDeletedRecords);
router.post('/data-management/deleted/:type/:id/restore', authenticateToken, requireAdmin, dashboardController.restoreDeletedRecord);

// System Reset
router.delete('/system/reset', authenticateToken, requireAdmin, dashboardController.resetData);
router.post('/system/reset/request-otp', authenticateToken, requireAdmin, dashboardController.requestResetOtp);
router.post('/system/reset/confirm', authenticateToken, requireAdmin, dashboardController.confirmReset);

// Account
router.delete('/account', authenticateToken, dashboardController.deleteAccount);

module.exports = router;
