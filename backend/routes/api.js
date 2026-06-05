const express = require('express');
const router = express.Router();

const { authenticateToken, requireAdmin, requireMaster } = require('../middleware/authMiddleware');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const stockController = require('../controllers/stockController');
const salesController = require('../controllers/salesController');
const attendanceController = require('../controllers/attendanceController');
const dashboardController = require('../controllers/dashboardController');
const masterController = require('../controllers/masterController');
const customerController = require('../controllers/customerController');
const exportController = require('../controllers/exportController');
const importController = require('../controllers/importController');
const notificationController = require('../controllers/notificationController');
const backupController = require('../features/backup/backup.controller');
const validate = require('../middleware/validate');
const { addSaleSchema, addAttendanceSchema, loginSchema } = require('../schemas/apiSchemas');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { loginLimiter, passwordResetLimiter, apiLimiter, reportLimiter, backupLimiter } = require('../middleware/rateLimiters');

// Apply API-wide rate limiting to everything except auth endpoints which have their own
router.use(apiLimiter);

// Auth (No JWT, Custom Cookies)
router.post('/auth/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/auth/logout', authController.logout);
router.post('/auth/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/auth/reset-password', passwordResetLimiter, authController.resetPassword);
router.post('/auth/change-password', authenticateToken, authController.changePassword);
router.get('/auth/session', authenticateToken, authController.getSession);

// Master Tier (Tier 1)
router.get('/master/stats', authenticateToken, requireMaster, masterController.getAppStats);
router.get('/master/sessions', authenticateToken, requireMaster, masterController.getLiveSessions);
router.get('/master/audit-log', authenticateToken, requireMaster, masterController.getActivityLog);
router.get('/master/admins', authenticateToken, requireMaster, masterController.getUsers);
router.post('/master/admins', authenticateToken, requireMaster, masterController.createClubAdmin);
router.post('/master/admins/:id/reset-password', authenticateToken, requireMaster, masterController.forceResetAdminPassword);
router.put('/master/admins/:id/toggle-status', authenticateToken, requireMaster, masterController.toggleAdminStatus);
router.put('/master/admins/:id/club-name', authenticateToken, requireMaster, masterController.updateAdminClubNameMaster);
router.delete('/master/admins/:id', authenticateToken, requireMaster, masterController.deleteClubAdmin);

// Dashboard & System
router.get('/admin/club-name', authenticateToken, requireAdmin, userController.getAdminClubName);
router.put('/admin/club-name', authenticateToken, requireAdmin, userController.updateAdminClubName);
router.get('/user/club-name', authenticateToken, userController.getUserClubName);
router.get('/dashboard/stats', authenticateToken, dashboardController.getStats);
router.put('/admin/config/setup-complete', authenticateToken, requireAdmin, dashboardController.completeSetup);
router.put('/settings/config', authenticateToken, requireAdmin, dashboardController.updateAdminConfig);

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
router.get('/settings/users', authenticateToken, requireAdmin, userController.getUsers);
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
router.delete('/account', authenticateToken, dashboardController.deleteAccount);
router.get('/login-history', authenticateToken, requireAdmin, userController.getLoginHistory);

// User Management
router.put('/users/me/password', authenticateToken, userController.changePassword);
router.get('/users', authenticateToken, requireAdmin, userController.getUsers);
router.post('/users', authenticateToken, requireAdmin, userController.createUser);
router.put('/users/:id/role', authenticateToken, requireAdmin, userController.updateUserRole);
router.post('/users/:id/reset-password', authenticateToken, requireAdmin, userController.adminUpdateUserPassword);
router.delete('/users/:id', authenticateToken, requireAdmin, userController.deleteUser);


// Customers
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
