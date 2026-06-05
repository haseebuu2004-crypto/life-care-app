const stockService = require('./stock.service');

exports.getStock = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const data = await stockService.getStock(ownerId);
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get Stock Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.addStock = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { variantId, quantity } = req.body; 
        
        await stockService.addStock(ownerId, variantId, quantity, req.user.id);
        
        res.json({ success: true, message: "Stock added successfully" });
    } catch (error) {
        if (error.message === "Product version not found or inactive") {
            return res.status(404).json({ success: false, message: error.message });
        }
        console.error("Add Stock Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateStockQuantity = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { id } = req.params; // stock_id
        const { quantity } = req.body;
        
        await stockService.updateStockQuantity(ownerId, id, quantity, req.user.id);
        
        res.json({ success: true, message: "Stock updated successfully." });
    } catch (error) {
        if (error.message === "Stock not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        console.error("Update Stock Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateStockPrice = async (req, res) => {
    res.status(400).json({ success: false, message: "Use product settings to update prices." });
};

exports.increaseStock = async (req, res) => {
    res.status(400).json({ success: false, message: "Use the add stock endpoint." });
};

exports.decreaseStock = async (req, res) => {
    res.status(400).json({ success: false, message: "Direct decrease disabled. Use sales or product manager." });
};

exports.deleteStock = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { id } = req.params; // stock_id

        await stockService.deleteStock(ownerId, id, req.user.id);
        
        res.json({ success: true, message: "Stock deleted." });
    } catch (error) {
        console.error("Delete Stock Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
