const express = require('express');
const router = express.Router();
const productController = require('./products.controller');
const productValidation = require('./products.validation');
const { authenticateToken } = require('../../shared/middleware/auth');
const { requireAdmin } = require('../../shared/middleware/authMiddleware');

// Products & Versions
router.get('/products', authenticateToken, productController.getProducts);
router.post('/products', authenticateToken, requireAdmin, productValidation.validateAddProduct, productController.addProduct);
router.put('/products/:id/price', authenticateToken, requireAdmin, productController.updateProductPrice);
router.put('/products/:id/toggle', authenticateToken, requireAdmin, productController.toggleProductStatus);

// Variants
router.post('/variants', authenticateToken, requireAdmin, productValidation.validateAddFlavour, productController.addVariant);
router.put('/variants/:id/toggle', authenticateToken, requireAdmin, productController.toggleVariant);
router.delete('/variants/:id', authenticateToken, requireAdmin, productController.deleteVariant);

module.exports = router;
