exports.validateAddCustomer = (req, res, next) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    next();
};
