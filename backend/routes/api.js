const express = require('express');
const router = express.Router();

const { authenticateToken, requireAdmin, requireMaster } = require('../middleware/authMiddleware');

const attendanceController = require('../controllers/attendanceController');
const dashboardController = require('../controllers/dashboardController');
const customerController = require('../controllers/customerController');
const productController = require('../controllers/productController');
const stockController = require('../controllers/stockController');
const salesController = require('../controllers/salesController');
const exportController = require('../controllers/exportController');
const importController = require('../controllers/importController');
const notificationController = require('../controllers/notificationController');
const backupController = require('../features/backup/backup.controller');
const validate = require('../middleware/validate');
const { addSaleSchema, addAttendanceSchema } = require('../schemas/apiSchemas');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { apiLimiter, reportLimiter, backupLimiter } = require('../middleware/rateLimiters');

const settingsRoutes = require('../features/settings/settings.routes');

// Apply API-wide rate limiting to everything except auth endpoints which have their own
router.use(apiLimiter);

// ---------------------------------------------------------
// NEW SETTINGS ROUTES
// ---------------------------------------------------------
router.use('/', settingsRoutes);

// Dashboard & System
router.get('/dashboard/stats', authenticateToken, dashboardController.getStats);

// System & Imports/Exports
router.get('/reports/export', authenticateToken, requireAdmin, reportLimiter, (req, res) => {
    const type = req.query.type;
    if (type === 'full_backup') {
        return exportController.exportExcel(req, res);
    }
    return exportController.exportPDF(req, res);
});
router.post('/reports/import', authenticateToken, requireAdmin, backupLimiter, upload.single('file'), importController.importCSV);

// Aliases for QA
router.get('/settings/users', authenticateToken, requireAdmin, (req, res) => res.redirect('/api/users'));
router.get('/reports', authenticateToken, requireAdmin, (req, res) => res.json({ success: true }));
router.post('/data-management/delete', authenticateToken, requireAdmin, dashboardController.resetData);

// Backup & Restore
router.get('/backup/logs', authenticateToken, requireAdmin, backupController.getBackupLogs);
router.post('/backup/generate', authenticateToken, requireAdmin, backupLimiter, backupController.generateBackup);
router.post('/backup/restore/validate', authenticateToken, requireAdmin, backupLimiter, upload.single('backupFile'), backupController.validateRestore);
router.post('/backup/restore/confirm', authenticateToken, requireAdmin, backupLimiter, upload.single('backupFile'), backupController.confirmRestore);

// Data Management deletions
router.delete('/data-management/attendance', authenticateToken, requireAdmin, dashboardController.clearAttendanceData);
router.delete('/data-management/sales', authenticateToken, requireAdmin, dashboardController.clearSalesData);

// Deleted Records
router.get('/data-management/deleted', authenticateToken, requireAdmin, dashboardController.getDeletedRecords);
router.post('/data-management/deleted/:type/:id/restore', authenticateToken, requireAdmin, dashboardController.restoreDeletedRecord);

router.delete('/system/reset', authenticateToken, requireAdmin, dashboardController.resetData);
router.post('/system/reset/request-otp', authenticateToken, requireAdmin, dashboardController.requestResetOtp);
router.post('/system/reset/confirm', authenticateToken, requireAdmin, dashboardController.confirmReset);
router.delete('/account', authenticateToken, dashboardController.deleteAccount);// Customers
router.get('/customers', authenticateToken, customerController.getCustomers);
router.post('/customers', authenticateToken, customerController.addCustomer);
router.put('/customers/:id', authenticateToken, customerController.updateCustomer);
router.delete('/customers/:id', authenticateToken, requireAdmin, customerController.deactivateCustomer);
router.get('/customers/:id/summary', authenticateToken, customerController.getCustomerSummary);

// Products & Versions
router.get('/products', authenticateToken, productController.getProducts);
router.post('/products', authenticateToken, requireAdmin, productController.addProduct);
router.put('/products/:id/price', authenticateToken, requireAdmin, productController.updateProductPrice);
router.put('/products/:id/toggle', authenticateToken, requireAdmin, productController.toggleProductStatus);

// Flavours
router.post('/flavours', authenticateToken, requireAdmin, productController.addFlavour);
router.put('/flavours/:id/toggle', authenticateToken, requireAdmin, productController.toggleFlavour);
router.delete('/flavours/:id', authenticateToken, requireAdmin, productController.deleteFlavour);

// Stock
router.get('/stock', authenticateToken, stockController.getStock);
router.post('/stock', authenticateToken, requireAdmin, stockController.addStock);
router.patch('/stock/:id', authenticateToken, requireAdmin, stockController.updateStockQuantity);
router.delete('/stock/:id', authenticateToken, requireAdmin, stockController.deleteStock);

// Sales
router.get('/sales', authenticateToken, salesController.getSales);
router.post('/sales', authenticateToken, validate(addSaleSchema), salesController.addSale);
router.delete('/sales/:id', authenticateToken, salesController.deleteSale);
router.delete('/sales/item/:id', authenticateToken, salesController.deleteSaleItem);

// Attendance
router.get('/attendance', authenticateToken, attendanceController.getAttendance);
router.post('/attendance', authenticateToken, validate(addAttendanceSchema), attendanceController.markAttendance);
router.delete('/attendance/:id', authenticateToken, attendanceController.deleteAttendance);

// Notifications
router.get('/notifications', authenticateToken, notificationController.getNotifications);
router.get('/notifications/unread-count', authenticateToken, notificationController.getUnreadCount);
router.put('/notifications/:id/read', authenticateToken, notificationController.markAsRead);
router.put('/notifications/read', authenticateToken, notificationController.markAsRead);

module.exports = router;
