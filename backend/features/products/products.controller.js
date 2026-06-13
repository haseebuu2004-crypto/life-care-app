const service = require('./products.service');

exports.getProducts = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const data = await service.getProducts(ownerId);
        res.json({ success: true, data });
    } catch (error) {
        if (error.message && error.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        console.error("Get Products Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const productId = await service.addProduct(ownerId, req.user.id, req.body);
        res.json({ success: true, message: "Product created", product_id: productId });
    } catch (error) {
        if (error.message && error.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        console.error("Add Product Error:", error);
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: "A product with this name already exists." });
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateProductPrice = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { id } = req.params;
        await service.updateProductPrice(id, ownerId, req.user.id, req.body);
        res.json({ success: true, message: "Product price updated and stock migrated." });
    } catch (error) {
        if (error.message && error.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        console.error("Update Price Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const newStatus = await service.toggleProductStatus(id);
        res.json({ success: true, message: `Product ${newStatus ? 'enabled' : 'disabled'}` });
    } catch (e) {
        if (e.message && e.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (e.status) return res.status(e.status).json({ success: false, message: e.message });
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.addVariant = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        await service.addVariant(ownerId, req.body);
        res.json({ success: true, message: "Variant added" });
    } catch (e) {
        if (e.message && e.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (e.code === '23505') {
            return res.status(400).json({ success: false, message: "This variant already exists for this product." });
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.toggleVariant = async (req, res) => {
    try {
        const { id } = req.params;
        await service.toggleVariant(id);
        res.json({ success: true, message: "Variant toggled" });
    } catch (e) {
        if (e.message && e.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (e.status) return res.status(e.status).json({ success: false, message: e.message });
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteVariant = async (req, res) => {
    try {
        const { id } = req.params;
        await service.deleteVariant(id);
        res.json({ success: true, message: "Variant deleted" });
    } catch (e) {
        if (e.message && e.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (e.status) return res.status(e.status).json({ success: false, message: e.message });
        res.status(500).json({ success: false, message: "Server error" });
    }
};
