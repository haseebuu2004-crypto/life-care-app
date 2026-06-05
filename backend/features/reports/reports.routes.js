const express = require('express');
const router = express.Router();
const multer = require('multer');
const reportsController = require('./reports.controller');
const { authenticateToken, requireAdmin } = require('../../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Dummy limiters to mimic production
const reportLimiter = (req, res, next) => next();
const backupLimiter = (req, res, next) => next();

router.get('/reports/export', authenticateToken, requireAdmin, reportLimiter, reportsController.exportData);
router.post('/reports/import', authenticateToken, requireAdmin, backupLimiter, upload.single('file'), reportsController.importCSV);
router.get('/reports', authenticateToken, requireAdmin, reportsController.ping);

module.exports = router;
