const express = require('express');
const router = express.Router();
const salesController = require('./sales.controller');
const { authenticateToken } = require('../../shared/middleware/auth');
const validate = require('../../middleware/validate');
const { addSaleSchema } = require('./sales.validation');

router.get('/sales', authenticateToken, salesController.getSales);
router.post('/sales', authenticateToken, validate(addSaleSchema), salesController.addSale);
router.delete('/sales/:id', authenticateToken, salesController.deleteSale);
router.delete('/sales/item/:id', authenticateToken, salesController.deleteSaleItem);

module.exports = router;
