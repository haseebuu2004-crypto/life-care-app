const express = require('express');
const router = express.Router();
const multer = require('multer');
const backupController = require('../controllers/backupController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware'); // assuming requireAdmin exists or we can just check it

const upload = multer({ storage: multer.memoryStorage() });

// Middleware to ensure admin only
const checkAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }
};

router.use(authenticateToken, checkAdmin);

router.post('/generate', backupController.generateBackup);
router.get('/logs', backupController.getBackupLogs);
router.post('/restore/validate', upload.single('backupFile'), backupController.validateRestore);
router.post('/restore/confirm', upload.single('backupFile'), backupController.confirmRestore);

module.exports = router;
