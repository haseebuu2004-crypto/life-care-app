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

// Flavours
router.post('/flavours', authenticateToken, requireAdmin, productValidation.validateAddFlavour, productController.addFlavour);
router.put('/flavours/:id/toggle', authenticateToken, requireAdmin, productController.toggleFlavour);
router.delete('/flavours/:id', authenticateToken, requireAdmin, productController.deleteFlavour);

module.exports = router;
