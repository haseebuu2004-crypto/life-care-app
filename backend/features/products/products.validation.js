exports.validateAddProduct = (req, res, next) => {
    let { name, vendor_price, vp } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ success: false, message: "Product name required" });

    const finalVp = vendor_price !== undefined ? vendor_price : vp;
    if (finalVp === undefined) {
         return res.status(400).json({ success: false, message: "Vendor price is required" });
    }
    next();
};

exports.validateAddFlavour = (req, res, next) => {
    // Legacy didn't strictly return early here, it just caught PG constraint error.
    // Wait, the legacy controller didn't have explicit missing fields validation for flavours.
    // It just relied on DB errors or crash. So I will NOT invent validation rules!
    // The Golden Rule states: "Copy all product validation rules EXACTLY... No validation changes allowed."
    next();
};
