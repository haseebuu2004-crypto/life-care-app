const queries = require('./customers.queries');
const audit = require('../../shared/utils/audit');

exports.getCustomers = async (ownerId) => {
    const result = await queries.getCustomers(ownerId);
    return result.rows;
};

exports.addCustomer = async (ownerId, userId, data) => {
    const { name, phone, member_code, joined_at } = data;
    const result = await queries.addCustomer(ownerId, name, phone, member_code, joined_at);
    const newId = result.rows[0].id;
    await audit.logAction(userId, 'CUSTOMER_CREATE', 'customers', newId);
    return newId;
};

exports.updateCustomer = async (id, ownerId, userId, data) => {
    const { name, phone, member_code } = data;
    await queries.updateCustomer(name, phone, member_code, id, ownerId);
    await audit.logAction(userId, 'CUSTOMER_UPDATE', 'customers', id);
};

exports.deactivateCustomer = async (id, ownerId, userId) => {
    await queries.deactivateCustomer(id, ownerId);
    await audit.logAction(userId, 'CUSTOMER_DEACTIVATE', 'customers', id);
};

exports.getCustomerSummary = async (id, ownerId) => {
    const custRes = await queries.getCustomerSummary_Customer(id, ownerId);
    if (custRes.rows.length === 0) {
        return null; // Not found
    }

    const [salesRes, attRes] = await Promise.all([
        queries.getCustomerSummary_Sales(id),
        queries.getCustomerSummary_Attendance(id)
    ]);

    let totalSpent = 0;
    let totalShakeProfit = 0;
    
    salesRes.rows.forEach(r => totalSpent += (r.price_charged * r.quantity));
    attRes.rows.forEach(r => totalShakeProfit += r.shake_amount);

    return {
        customer: custRes.rows[0], 
        sales: salesRes.rows, 
        attendance: attRes.rows,
        totalSpent: totalSpent / 100,
        totalShakeProfit: totalShakeProfit / 100
    };
};

exports.findOrCreateCustomer = async (ownerId, customerName, userId) => {
    const existing = await queries.findCustomerByName(ownerId, customerName);
    if (existing.rows.length > 0) {
        return existing.rows[0].id;
    } else {
        const newCust = await queries.insertCustomerMinimal(ownerId, customerName);
        const newId = newCust.rows[0].id;
        await audit.logAction(userId, 'CUSTOMER_CREATE', 'customers', newId);
        return newId;
    }
};
