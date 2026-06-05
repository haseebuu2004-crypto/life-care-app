const express = require('express');
const router = express.Router();
const stockController = require('./stock.controller');
const stockValidation = require('./stock.validation');
const { authenticateToken } = require('../../shared/middleware/auth');
const { requireAdmin } = require('../../middleware/authMiddleware');

router.get('/stock', authenticateToken, stockController.getStock);
router.post('/stock', authenticateToken, requireAdmin, stockValidation.validateAddStock, stockController.addStock);
router.patch('/stock/:id', authenticateToken, requireAdmin, stockValidation.validateUpdateStock, stockController.updateStockQuantity);
router.delete('/stock/:id', authenticateToken, requireAdmin, stockController.deleteStock);

module.exports = router;
