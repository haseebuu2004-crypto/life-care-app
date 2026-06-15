const inventoryService = require('./inventory.service');

exports.getEntities = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const entities = await inventoryService.getEntities(ownerId);
        res.status(200).json(entities);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
    }
};

exports.searchEntities = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const q = req.query.q;
        const entities = await inventoryService.searchEntities(ownerId, q);
        res.status(200).json(entities);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
    }
};

exports.updateEntity = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const userId = req.user.id; // Assuming user ID is the same for logging, or you have a distinct token
        const variantId = req.params.id;
        const data = req.body;
        
        const result = await inventoryService.updateEntity(variantId, ownerId, userId, data);
        res.status(200).json({ message: 'Updated successfully', data: result });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
    }
};
