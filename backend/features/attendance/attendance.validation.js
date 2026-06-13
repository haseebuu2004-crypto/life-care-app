exports.validateAttendance = (req, res, next) => {
    const { customerId, customerName, date, type, shakeProfit } = req.body;
    
    // We only fail fast if both customerId and customerName are missing, 
    // because findOrCreateCustomer will handle the name later.
    // However, the legacy logic did:
    // if (!customerId && customerName) { ... find/create ... }
    // if (!customerId) return res.status(400).json({ success: false, message: "Valid customer selection is required." });
    
    // So if neither is provided, it will fail the second check.
    if (!customerId && !customerName) {
        return res.status(400).json({ success: false, message: "Valid customer selection is required." });
    }

    if (date) {
        const todayStr = new Date().toLocaleDateString('en-CA');
        if (date > todayStr) {
            return res.status(400).json({ success: false, message: "Attendance cannot be marked for future dates." });
        }
    }

    next();
};
