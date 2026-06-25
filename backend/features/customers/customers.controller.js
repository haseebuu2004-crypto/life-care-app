const customerService = require('./customers.service');

// Safely extract ownerId from session — never from query params or body
const getOwnerId = (req) => req.user.owner_id || req.user.id;

exports.getCustomers = async (req, res) => {
    try {
        const ownerId = getOwnerId(req);
        const customers = await customerService.getCustomers(ownerId);
        res.json({ success: true, data: customers });
    } catch (e) {
        if (e.message && e.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        console.error("getCustomers error:", e);
        res.status(500).json({ success: false, message: "Failed to retrieve customers." });
    }
};

exports.addCustomer = async (req, res) => {
    try {
        const ownerId = getOwnerId(req);
        const userId = req.user.id;
        const newId = await customerService.addCustomer(ownerId, userId, req.body);
        res.json({ success: true, message: "Customer added", customer_id: newId });
    } catch (e) {
        if (e.message && e.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (e.statusCode === 400) {
            return res.status(400).json({ success: false, message: e.message });
        }
        console.error("addCustomer error:", e);
        res.status(500).json({ success: false, message: "Failed to add customer." });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const ownerId = getOwnerId(req);
        const userId = req.user.id;
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: "Customer ID is required." });
        await customerService.updateCustomer(id, ownerId, userId, req.body);
        res.json({ success: true, message: "Customer updated" });
    } catch (e) {
        if (e.message && e.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (e.statusCode === 400) {
            return res.status(400).json({ success: false, message: e.message });
        }
        console.error("updateCustomer error:", e);
        res.status(500).json({ success: false, message: "Failed to update customer." });
    }
};

exports.deactivateCustomer = async (req, res) => {
    try {
        const ownerId = getOwnerId(req);
        const userId = req.user.id;
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: "Customer ID is required." });
        await customerService.deactivateCustomer(id, ownerId, userId);
        res.json({ success: true, message: "Customer deactivated" });
    } catch (e) {
        if (e.message && e.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        console.error("deactivateCustomer error:", e);
        res.status(500).json({ success: false, message: "Failed to deactivate customer." });
    }
};

exports.getCustomerSummary = async (req, res) => {
    try {
        const ownerId = getOwnerId(req);
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: "Customer ID is required." });
        
        console.log(`[DEBUG] getCustomerSummary called for id: ${id}, owner: ${ownerId}`);
        const summary = await customerService.getCustomerSummary(id, ownerId);
        console.log(`[DEBUG] getCustomerSummary finished for id: ${id}`);
        
        if (!summary) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }

        res.json({ success: true, data: summary });
    } catch (e) {
        if (e.message && e.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        console.error("getCustomerSummary error:", e);
        res.status(500).json({ success: false, message: "Failed to retrieve customer summary." });
    }
};
