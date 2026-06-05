const db = require('../db');
const audit = require('../services/auditLogService');

exports.getCustomers = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const result = await db.query(
            `SELECT c.id, c.name, c.phone, c.member_code, c.joined_at, c.is_active,
             (SELECT COALESCE(SUM((si.price_charged) * si.quantity), 0) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.customer_id = c.id AND s.is_deleted = false) as total_sales_revenue
             FROM customers c 
             WHERE c.owner_id = $1 
             ORDER BY c.name ASC`, 
            [ownerId]
        );
        res.json({ success: true, data: result.rows });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.addCustomer = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { name, phone, member_code, joined_at } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Name is required" });

        const result = await db.query(
            `INSERT INTO customers (owner_id, name, phone, member_code, joined_at) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [ownerId, name.trim(), phone || null, member_code || null, joined_at || new Date().toISOString().split('T')[0]]
        );
        
        await audit.logAction(req.user.id, 'CUSTOMER_CREATE', 'customers', result.rows[0].id);
        res.json({ success: true, message: "Customer added", customer_id: result.rows[0].id });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { id } = req.params;
        const { name, phone, member_code } = req.body;
        
        await db.query(
            `UPDATE customers SET name = $1, phone = $2, member_code = $3 WHERE id = $4 AND owner_id = $5`,
            [name.trim(), phone || null, member_code || null, id, ownerId]
        );
        
        await audit.logAction(req.user.id, 'CUSTOMER_UPDATE', 'customers', id);
        res.json({ success: true, message: "Customer updated" });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.deactivateCustomer = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { id } = req.params;
        
        await db.query(`UPDATE customers SET is_active = false WHERE id = $1 AND owner_id = $2`, [id, ownerId]);
        await audit.logAction(req.user.id, 'CUSTOMER_DEACTIVATE', 'customers', id);
        res.json({ success: true, message: "Customer deactivated" });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getCustomerSummary = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { id } = req.params;

        const custRes = await db.query(`SELECT * FROM customers WHERE id = $1 AND owner_id = $2`, [id, ownerId]);
        if (custRes.rows.length === 0) return res.status(404).json({ success: false, message: "Not found" });

        const [salesRes, attRes] = await Promise.all([
            db.query(`SELECT s.id, s.sale_date, si.quantity, si.price_charged, pv.selling_price, p.name as product_name
                      FROM sales s 
                      JOIN sale_items si ON s.id = si.sale_id
                      JOIN product_versions pv ON si.product_version_id = pv.id
                      JOIN products p ON pv.product_id = p.id
                      WHERE s.customer_id = $1 AND s.is_deleted = false
                      ORDER BY s.sale_date DESC`, [id]),
            db.query(`SELECT id, attendance_date, type, shake_amount FROM attendance WHERE customer_id = $1 AND is_deleted = false ORDER BY attendance_date DESC`, [id])
        ]);

        let totalSpent = 0;
        let totalShakeProfit = 0;
        
        salesRes.rows.forEach(r => totalSpent += (r.price_charged * r.quantity));
        attRes.rows.forEach(r => totalShakeProfit += r.shake_amount);

        res.json({ 
            success: true, 
            data: { 
                customer: custRes.rows[0], 
                sales: salesRes.rows, 
                attendance: attRes.rows,
                totalSpent: totalSpent / 100,
                totalShakeProfit: totalShakeProfit / 100
            } 
        });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
