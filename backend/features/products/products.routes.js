const express = require('express');
const router = express.Router();
const productController = require('./products.controller');
const validate = require('../../shared/middleware/validate');
const { addProductSchema, updateProductPriceSchema, addVariantSchema, toggleStatusSchema } = require('../../schemas/apiSchemas');
const { authenticateToken, requireAdmin } = require('../../shared/middleware/authMiddleware');

// Products & Versions
router.get('/products', authenticateToken, productController.getProducts);
router.post('/products', authenticateToken, requireAdmin, validate(addProductSchema), productController.addProduct);
router.put('/products/:id/price', authenticateToken, requireAdmin, validate(updateProductPriceSchema), productController.updateProductPrice);
router.put('/products/:id/toggle', authenticateToken, requireAdmin, validate(toggleStatusSchema), productController.toggleProductStatus);

// Variants
router.post('/variants', authenticateToken, requireAdmin, validate(addVariantSchema), productController.addVariant);
router.put('/variants/:id/toggle', authenticateToken, requireAdmin, validate(toggleStatusSchema), productController.toggleVariant);
router.delete('/variants/:id', authenticateToken, requireAdmin, validate(toggleStatusSchema), productController.deleteVariant);

module.exports = router;
