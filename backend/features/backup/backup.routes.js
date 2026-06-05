const express = require('express');
const router = express.Router();
const multer = require('multer');
const backupController = require('./backup.controller');
const { authenticateToken, requireAdmin } = require('../../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Dummy limiters to mimic production
const backupLimiter = (req, res, next) => next();

router.get('/backup/logs', authenticateToken, requireAdmin, backupController.getBackupLogs);
router.post('/backup/generate', authenticateToken, requireAdmin, backupLimiter, backupController.generateBackup);
router.post('/backup/restore/validate', authenticateToken, requireAdmin, backupLimiter, upload.single('backupFile'), backupController.validateRestore);
router.post('/backup/restore/confirm', authenticateToken, requireAdmin, backupLimiter, upload.single('backupFile'), backupController.confirmRestore);

module.exports = router;
