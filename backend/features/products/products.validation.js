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
    const { name, product_id, product_version_id } = req.body;
    
    if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: "Variant/Flavour name is required" });
    }
    
    if (!product_id && !product_version_id) {
        return res.status(400).json({ success: false, message: "Product ID or Product Version ID is required" });
    }
    
    next();
};
