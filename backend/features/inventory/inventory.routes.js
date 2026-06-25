const express = require('express');
const router = express.Router();
const inventoryController = require('./inventory.controller');
const { authenticateToken, requireAdmin } = require('../../shared/middleware/authMiddleware');

router.use(authenticateToken);

router.get('/entities', inventoryController.getEntities);
router.get('/search', inventoryController.searchEntities);
router.put('/entities/:id', inventoryController.updateEntity);

module.exports = router;
