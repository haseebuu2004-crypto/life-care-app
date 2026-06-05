const express = require('express');
const router = express.Router();
const customerController = require('./customers.controller');
const customerValidation = require('./customers.validation');
const { authenticateToken } = require('../../shared/middleware/auth');
const { requireAdmin } = require('../../middleware/authMiddleware');

router.get('/', authenticateToken, customerController.getCustomers);
router.post('/', authenticateToken, customerValidation.validateAddCustomer, customerController.addCustomer);
router.put('/:id', authenticateToken, customerController.updateCustomer);
router.delete('/:id', authenticateToken, requireAdmin, customerController.deactivateCustomer);
router.get('/:id/summary', authenticateToken, customerController.getCustomerSummary);

module.exports = router;
