const customerService = require('./customers.service');

exports.getCustomers = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const customers = await customerService.getCustomers(ownerId);
        res.json({ success: true, data: customers });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.addCustomer = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const userId = req.user.id;
        const newId = await customerService.addCustomer(ownerId, userId, req.body);
        res.json({ success: true, message: "Customer added", customer_id: newId });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const userId = req.user.id;
        const { id } = req.params;
        await customerService.updateCustomer(id, ownerId, userId, req.body);
        res.json({ success: true, message: "Customer updated" });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.deactivateCustomer = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const userId = req.user.id;
        const { id } = req.params;
        await customerService.deactivateCustomer(id, ownerId, userId);
        res.json({ success: true, message: "Customer deactivated" });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getCustomerSummary = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { id } = req.params;
        const summary = await customerService.getCustomerSummary(id, ownerId);
        
        if (!summary) {
            return res.status(404).json({ success: false, message: "Not found" });
        }

        res.json({ success: true, data: summary });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
