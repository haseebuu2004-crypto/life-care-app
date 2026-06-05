exports.validateAddStock = (req, res, next) => {
    const { variantId, quantity } = req.body; 
    if (!variantId || !quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: "Valid version ID and quantity > 0 required" });
    }
    next();
};

exports.validateUpdateStock = (req, res, next) => {
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 0) {
        return res.status(400).json({ success: false, message: "Valid quantity >= 0 required" });
    }
    next();
};
