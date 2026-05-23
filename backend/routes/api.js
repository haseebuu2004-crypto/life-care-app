const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const stockController = require('../controllers/stockController');
const salesController = require('../controllers/salesController');
const attendanceController = require('../controllers/attendanceController');
const dashboardController = require('../controllers/dashboardController');

// Dashboard Stats
router.get('/dashboard/stats', authenticateToken, dashboardController.getStats);
router.delete('/system/reset', authenticateToken, dashboardController.resetData);
router.get('/reports/export', authenticateToken, dashboardController.exportReport);

// Data Management
router.delete('/data-management/attendance', authenticateToken, dashboardController.clearAttendanceData);
router.delete('/data-management/sales', authenticateToken, dashboardController.clearSalesData);

// Protect Profit APIs as requested (Removed - Handled by /dashboard/stats)

// Auth
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/google', authController.googleLogin);
router.post('/auth/select-role', authenticateToken, authController.selectRole);
router.post('/auth/set-password', authenticateToken, authController.setPassword);
router.post('/auth/verify-password', authenticateToken, authController.verifyPassword);
router.post('/auth/forgot-password', authenticateToken, authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/logout', authenticateToken, authController.logout);
router.get('/login-history', authenticateToken, authController.getLoginHistory);

// User Management (Admin only)
router.get('/users', authenticateToken, userController.getUsers);
router.post('/users', authenticateToken, userController.createUser);
router.put('/users/:id/role', authenticateToken, userController.updateUserRole);
router.delete('/users/:id', authenticateToken, userController.deleteUser);

// Products
router.get('/products', authenticateToken, productController.getProducts); // readable by all
router.post('/products', authenticateToken, productController.createProduct);
router.delete('/products/:id', authenticateToken, productController.deleteProduct);

// Stock
router.get('/stock', authenticateToken, stockController.getStock);
router.post('/stock', authenticateToken, stockController.addStock);
router.put('/stock/:id/add', authenticateToken, stockController.increaseStock);
router.patch('/stock/:id', authenticateToken, stockController.updateStockQuantity);
router.delete('/stock/:id', authenticateToken, stockController.deleteStock);

// Sales
router.get('/sales', authenticateToken, salesController.getSales);
router.post('/sales', authenticateToken, salesController.addSale);
router.delete('/sales/:id', authenticateToken, salesController.deleteSale);
router.delete('/sales/item/:itemId', authenticateToken, salesController.deleteSaleItem);

// Attendance
router.get('/attendance', authenticateToken, attendanceController.getAttendance);
router.post('/attendance', authenticateToken, attendanceController.markAttendance);
router.delete('/attendance/:id', authenticateToken, attendanceController.deleteAttendance);

// Usage / Customers removed

module.exports = router;
