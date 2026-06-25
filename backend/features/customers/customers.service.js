const queries = require('./customers.queries');
const audit = require('../../shared/utils/audit');

exports.getCustomers = async (ownerId) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        const result = await queries.getCustomers(ownerId);
        if (!result || !result.rows) return [];
        return result.rows || [];
    } catch (error) {
        console.error('[CustomersService] error:', error);
        throw error;
    }
};

exports.addCustomer = async (ownerId, userId, data) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        const { name, phone, member_code, joined_at } = data;
        if (!name || !name.trim()) {
            throw Object.assign(new Error("Customer name is required."), { statusCode: 400 });
        }
        const result = await queries.addCustomer(ownerId, name, phone, member_code, joined_at);
        if (!result || !result.rows) throw new Error("Failed to create customer record.");
        const newId = result.rows[0]?.id;
        if (!newId) throw new Error("Failed to create customer record.");
        await audit.logAction(userId, 'CUSTOMER_CREATE', 'customers', newId);
        return newId;
    } catch (error) {
        console.error('[CustomersService] error:', error);
        throw error;
    }
};

exports.updateCustomer = async (id, ownerId, userId, data) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        const { name, phone, member_code } = data;
        if (!name || !name.trim()) {
            throw Object.assign(new Error("Customer name is required."), { statusCode: 400 });
        }
        await queries.updateCustomer(name, phone, member_code, id, ownerId);
        await audit.logAction(userId, 'CUSTOMER_UPDATE', 'customers', id);
    } catch (error) {
        console.error('[CustomersService] error:', error);
        throw error;
    }
};

exports.deactivateCustomer = async (id, ownerId, userId) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        await queries.deactivateCustomer(id, ownerId);
        await audit.logAction(userId, 'CUSTOMER_DEACTIVATE', 'customers', id);
    } catch (error) {
        console.error('[CustomersService] error:', error);
        throw error;
    }
};

exports.getCustomerSummary = async (id, ownerId) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        const custRes = await queries.getCustomerSummary_Customer(id, ownerId);
        if (!custRes || !custRes.rows || custRes.rows.length === 0) {
            return null;
        }

        const [salesRes, attRes] = await Promise.all([
            queries.getCustomerSummary_Sales(id, ownerId),
            queries.getCustomerSummary_Attendance(id, ownerId)
        ]);

        let totalSpent = 0;
        let totalSalesProfit = 0;
        let totalShakeProfit = 0;
        
        ((salesRes && salesRes.rows) || []).forEach(r => {
            const price = Number(r.price_charged) || 0;
            const vendorPrice = Number(r.vendor_price_snap) || 0;
            const qty = Number(r.quantity) || 0;
            totalSpent += price * qty;
            totalSalesProfit += (price - vendorPrice) * qty;
        });
        ((attRes && attRes.rows) || []).forEach(r => {
            totalShakeProfit += Number(r.shake_amount) || 0;
        });

        return {
            customer: custRes.rows[0], 
            sales: (salesRes && salesRes.rows) ? salesRes.rows : [], 
            attendance: (attRes && attRes.rows) ? attRes.rows : [],
            totalSpent: totalSpent / 100,
            totalSalesProfit: totalSalesProfit / 100,
            totalShakeProfit: totalShakeProfit / 100
        };
    } catch (error) {
        console.error('[CustomersService] error:', error);
        throw error;
    }
};

exports.findOrCreateCustomer = async (ownerId, customerName, userId) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        const existing = await queries.findCustomerByName(ownerId, customerName);
        if (existing && existing.rows && existing.rows.length > 0) {
            const existingCust = existing.rows[0];
            if (existingCust.name !== customerName.trim()) {
                await queries.updateCustomerNameOnly(existingCust.id, ownerId, customerName.trim());
            }
            return existingCust.id;
        } else {
            const newCust = await queries.insertCustomerMinimal(ownerId, customerName);
            if (!newCust || !newCust.rows) throw new Error("Failed to create customer record.");
            const newId = newCust.rows[0]?.id;
            if (!newId) throw new Error("Failed to create customer record.");
            await audit.logAction(userId, 'CUSTOMER_CREATE', 'customers', newId);
            return newId;
        }
    } catch (error) {
        console.error('[CustomersService] error:', error);
        throw error;
    }
};
