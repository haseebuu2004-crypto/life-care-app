// ============================================================
// PDF: Sales Report
// ============================================================
exports.getPDFSales = (ownerId, dateFilterStr) => {
    return {
        text: `
            SELECT 
                s.sale_date, c.name as customer, p.name as product, 
                si.quantity, si.price_charged,
                ((si.price_charged - si.vendor_price_snap) * si.quantity) as item_profit
            FROM sales s
            JOIN customers c ON s.customer_id = c.id
            JOIN sale_items si ON si.sale_id = s.id
            JOIN product_versions pv ON si.product_version_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE s.owner_id = $1 AND s.is_deleted = false
            ${dateFilterStr}
            ORDER BY s.sale_date DESC
        `,
        values: [ownerId]
    };
};

// ============================================================
// PDF: Attendance Report
// ============================================================
exports.getPDFAttendance = (ownerId, dateFilterStr) => {
    return {
        text: `
            SELECT a.attendance_date, c.name, a.type, a.shake_amount
            FROM attendance a
            JOIN customers c ON a.customer_id = c.id
            WHERE a.owner_id = $1 AND a.is_deleted = false
            ${dateFilterStr}
            ORDER BY a.attendance_date DESC
        `,
        values: [ownerId]
    };
};

// ============================================================
// PDF: Summary Report Stats
// ============================================================
exports.getPDFSummarySalesStats = (ownerId, dateFilterStr) => {
    return {
        text: `
            SELECT 
                SUM(si.price_charged * si.quantity) as rev, 
                SUM((si.price_charged - si.vendor_price_snap) * si.quantity) as prof 
            FROM sales s
            JOIN sale_items si ON s.id = si.sale_id
            WHERE s.owner_id = $1 AND s.is_deleted = false
            ${dateFilterStr}
        `,
        values: [ownerId]
    };
};

exports.getPDFSummaryAttendanceStats = (ownerId, dateFilterStr) => {
    return {
        text: `
            SELECT SUM(shake_amount) as att_prof 
            FROM attendance a
            WHERE a.owner_id = $1 AND a.is_deleted = false
            ${dateFilterStr}
        `,
        values: [ownerId]
    };
};

exports.getPDFSummaryCustomerCount = (ownerId) => {
    return {
        text: `SELECT COUNT(*) as count FROM customers WHERE owner_id = $1 AND is_active = true`,
        values: [ownerId]
    };
};

// ============================================================
// Config / Branding
// ============================================================
exports.getClubName = (ownerId) => {
    return {
        text: `SELECT club_name FROM admin_config WHERE owner_id = $1`,
        values: [ownerId]
    };
};

// ============================================================
// Excel: Export Customers
// ============================================================
exports.getExcelCustomers = (ownerId) => {
    return {
        text: `SELECT * FROM customers WHERE owner_id = $1`,
        values: [ownerId]
    };
};

// ============================================================
// Excel: Export Sales
// ============================================================
exports.getExcelSales = (ownerId) => {
    return {
        text: `
            SELECT s.id as sale_id, s.sale_date, c.name as customer, p.name as product, si.quantity as qty, si.price_charged as price
            FROM sales s
            JOIN customers c ON s.customer_id = c.id
            JOIN sale_items si ON si.sale_id = s.id
            JOIN product_versions pv ON si.product_version_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE s.owner_id = $1 AND s.is_deleted = false
        `,
        values: [ownerId]
    };
};

// ============================================================
// Import: Customer Queries
// ============================================================
exports.getExistingCustomerById = (id, ownerId) => {
    return {
        text: `SELECT id FROM customers WHERE id = $1 AND owner_id = $2`,
        values: [id, ownerId]
    };
};

exports.updateCustomerById = (name, phone, id) => {
    return {
        text: `UPDATE customers SET name = $1, phone = $2 WHERE id = $3`,
        values: [name, phone, id]
    };
};

exports.insertCustomerWithId = (id, ownerId, name, phone) => {
    return {
        text: `INSERT INTO customers (id, owner_id, name, phone) VALUES ($1, $2, $3, $4)`,
        values: [id, ownerId, name, phone]
    };
};

exports.insertCustomerWithoutId = (ownerId, name, phone) => {
    return {
        text: `INSERT INTO customers (owner_id, name, phone) VALUES ($1, $2, $3)`,
        values: [ownerId, name, phone]
    };
};

// ============================================================
// Import: Product Queries
// ============================================================
exports.insertProduct = (ownerId, name) => {
    return {
        text: `INSERT INTO products (owner_id, name) VALUES ($1, $2) RETURNING id`,
        values: [ownerId, name]
    };
};

exports.insertProductVersion = (productId, vendorPrice, createdBy) => {
    return {
        text: `INSERT INTO product_versions (product_id, vendor_price, created_by) VALUES ($1, $2, $3) RETURNING id`,
        values: [productId, vendorPrice, createdBy]
    };
};

exports.insertInitialStock = (versionId, ownerId, quantity, vendorPrice, addedBy) => {
    return {
        text: `INSERT INTO stock (product_version_id, owner_id, quantity, vendor_price_snap, added_by) VALUES ($1, $2, $3, $4, $5)`,
        values: [versionId, ownerId, quantity, vendorPrice, addedBy]
    };
};
