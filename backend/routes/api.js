const express = require('express');
const router = express.Router();

const { apiLimiter } = require('../shared/middleware/rateLimiters');

// Feature Routes
const authRoutes = require('../features/auth/auth.routes');
const settingsRoutes = require('../features/settings/settings.routes');
const masterRoutes = require('../features/master/master.routes');
const dashboardRoutes = require('../features/dashboard/dashboard.routes');
const reportsRoutes = require('../features/reports/reports.routes');
const backupRoutes = require('../features/backup/backup.routes');
const customersRoutes = require('../features/customers/customers.routes');
const productsRoutes = require('../features/products/products.routes');
const stockRoutes = require('../features/stock/stock.routes');
const salesRoutes = require('../features/sales/sales.routes');
const attendanceRoutes = require('../features/attendance/attendance.routes');
const notificationsRoutes = require('../features/notifications/notifications.routes');
const inventoryRoutes = require('../features/inventory/inventory.routes');

// Apply API-wide rate limiting to everything except auth endpoints which have their own
router.use(apiLimiter);

// ---------------------------------------------------------
// FEATURE ROUTES
// ---------------------------------------------------------
router.use('/auth', authRoutes);
router.use('/master', masterRoutes);
router.use('/', settingsRoutes);
router.use('/', dashboardRoutes);
router.use('/', reportsRoutes);
router.use('/', backupRoutes);
router.use('/customers', customersRoutes);
router.use('/', productsRoutes);
router.use('/', stockRoutes);
router.use('/', salesRoutes);
router.use('/', attendanceRoutes);
router.use('/', notificationsRoutes);
router.use('/inventory', inventoryRoutes);

module.exports = router;
