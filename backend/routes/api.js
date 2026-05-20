const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole, ADMIN_ONLY, ALL_ROLES } = require('../middleware/roleMiddleware');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const stockController = require('../controllers/stockController');
const salesController = require('../controllers/salesController');
const attendanceController = require('../controllers/attendanceController');
const dashboardController = require('../controllers/dashboardController');

// Dashboard Stats
router.get('/dashboard/stats', authenticateToken, dashboardController.getStats);
router.delete('/system/reset', authenticateToken, authorizeRole(ADMIN_ONLY), dashboardController.resetData);
router.get('/reports/export', authenticateToken, authorizeRole(ADMIN_ONLY), dashboardController.exportReport);

// Data Management
router.delete('/data-management/attendance', authenticateToken, authorizeRole(ADMIN_ONLY), dashboardController.clearAttendanceData);
router.delete('/data-management/sales', authenticateToken, authorizeRole(ADMIN_ONLY), dashboardController.clearSalesData);

// Protect Profit APIs as requested
router.get('/dashboard/profit', authenticateToken, authorizeRole(ADMIN_ONLY), dashboardController.getProfit || ((req, res) => res.json({})));
router.get('/dashboard/shake-profit', authenticateToken, authorizeRole(ADMIN_ONLY), dashboardController.getShakeProfit || ((req, res) => res.json({})));

// Auth
router.post('/auth/login', authController.login);
router.post('/auth/google', authController.googleLogin);
router.post('/auth/logout', authenticateToken, authController.logout);
router.get('/login-history', authenticateToken, authorizeRole(ADMIN_ONLY), authController.getLoginHistory);

// User Management (Admin only)
router.get('/users', authenticateToken, authorizeRole(ADMIN_ONLY), userController.getUsers);
router.post('/users', authenticateToken, authorizeRole(ADMIN_ONLY), userController.createUser);
router.put('/users/:id/role', authenticateToken, authorizeRole(ADMIN_ONLY), userController.updateUserRole);
router.delete('/users/:id', authenticateToken, authorizeRole(ADMIN_ONLY), userController.deleteUser);

// Products
router.get('/products', authenticateToken, productController.getProducts); // readable by all
router.post('/products', authenticateToken, authorizeRole(ADMIN_ONLY), productController.createProduct);
router.delete('/products/:id', authenticateToken, authorizeRole(ADMIN_ONLY), productController.deleteProduct);

// Stock
router.get('/stock', authenticateToken, authorizeRole(ALL_ROLES), stockController.getStock);
router.post('/stock', authenticateToken, authorizeRole(ADMIN_ONLY), stockController.addStock);
router.put('/stock/:id/add', authenticateToken, authorizeRole(ADMIN_ONLY), stockController.increaseStock);
router.patch('/stock/:id', authenticateToken, authorizeRole(ADMIN_ONLY), stockController.updateStockQuantity);
router.delete('/stock/:id', authenticateToken, authorizeRole(ADMIN_ONLY), stockController.deleteStock);

// Sales
router.get('/sales', authenticateToken, authorizeRole(ALL_ROLES), salesController.getSales);
router.post('/sales', authenticateToken, authorizeRole(ALL_ROLES), salesController.addSale);
router.delete('/sales/:id', authenticateToken, authorizeRole(ALL_ROLES), salesController.deleteSale);

// Attendance
router.get('/attendance', authenticateToken, authorizeRole(ALL_ROLES), attendanceController.getAttendance);
router.post('/attendance', authenticateToken, authorizeRole(ALL_ROLES), attendanceController.markAttendance);
router.delete('/attendance/:id', authenticateToken, authorizeRole(ADMIN_ONLY), attendanceController.deleteAttendance);

// Usage / Customers removed

module.exports = router;
