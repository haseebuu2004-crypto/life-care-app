const db = require('../../shared/db/connection');

exports.getCustomers = (ownerId) => {
    return db.query(
        `SELECT c.id, c.name, c.phone, c.member_code, c.joined_at, c.is_active,
         COALESCE(
           (SELECT SUM(si.price_charged::integer * si.quantity::integer) 
            FROM sale_items si 
            JOIN sales s ON si.sale_id = s.id 
            WHERE s.customer_id = c.id AND s.is_deleted = false AND s.owner_id = $1),
           0
         ) as total_sales_revenue,
         COALESCE(
           (SELECT SUM((si.price_charged::integer - si.vendor_price_snap::integer) * si.quantity::integer) 
            FROM sale_items si 
            JOIN sales s ON si.sale_id = s.id 
            WHERE s.customer_id = c.id AND s.is_deleted = false AND s.owner_id = $1),
           0
         ) as total_sales_profit,
         COALESCE(
           (SELECT SUM(a.shake_amount::integer) 
            FROM attendance a 
            WHERE a.customer_id = c.id AND a.is_deleted = false AND a.owner_id = $1),
           0
         ) as total_shake_profit
         FROM customers c 
         WHERE c.owner_id = $1 
         ORDER BY c.name ASC`, 
        [ownerId]
    );
};

exports.addCustomer = (ownerId, name, phone, member_code, joined_at) => {
    return db.query(
        `INSERT INTO customers (owner_id, name, phone, member_code, joined_at) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [ownerId, name.trim(), phone || null, member_code || null, joined_at || new Date().toLocaleDateString('en-CA')]
    );
};

exports.updateCustomer = (name, phone, member_code, id, ownerId) => {
    return db.query(
        `UPDATE customers SET name = $1, phone = $2, member_code = $3 WHERE id = $4 AND owner_id = $5`,
        [name.trim(), phone || null, member_code || null, id, ownerId]
    );
};

exports.deactivateCustomer = (id, ownerId) => {
    return db.query(`UPDATE customers SET is_active = false WHERE id = $1 AND owner_id = $2`, [id, ownerId]);
};

exports.getCustomerSummary_Customer = (id, ownerId) => {
    return db.query(`SELECT * FROM customers WHERE id = $1 AND owner_id = $2`, [id, ownerId]);
};

exports.getCustomerSummary_Sales = (id, ownerId) => {
    return db.query(
        `SELECT s.id, s.sale_date, si.quantity, si.price_charged, si.vendor_price_snap, p.name as product_name
         FROM sales s 
         JOIN sale_items si ON s.id = si.sale_id
         JOIN product_versions pv ON si.product_version_id = pv.id
         JOIN products p ON pv.product_id = p.id
         WHERE s.customer_id = $1 AND s.owner_id = $2 AND s.is_deleted = false
         ORDER BY s.sale_date DESC`,
        [id, ownerId]
    );
};

exports.getCustomerSummary_Attendance = (id, ownerId) => {
    return db.query(
        `SELECT id, attendance_date, type, shake_amount 
         FROM attendance 
         WHERE customer_id = $1 AND owner_id = $2 AND is_deleted = false 
         ORDER BY attendance_date DESC`,
        [id, ownerId]
    );
};

exports.findCustomerByName = (ownerId, customerName) => {
    return db.query(`SELECT id, name FROM customers WHERE owner_id = $1 AND name ILIKE $2`, [ownerId, customerName.trim()]);
};

exports.updateCustomerNameOnly = (id, ownerId, name) => {
    return db.query(`UPDATE customers SET name = $1 WHERE id = $2 AND owner_id = $3`, [name.trim(), id, ownerId]);
};

exports.insertCustomerMinimal = (ownerId, customerName) => {
    return db.query(`INSERT INTO customers (owner_id, name) VALUES ($1, $2) RETURNING id`, [ownerId, customerName.trim()]);
};
