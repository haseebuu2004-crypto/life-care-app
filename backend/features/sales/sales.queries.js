// ============================================================
// Sales User Query — user sees only own sales
// Source: salesController.js lines 10-28
// ============================================================
exports.getSalesUser = (ownerId, userId) => {
    return {
        text: `
            SELECT s.*, c.name as customer_name
            FROM sales s
            JOIN customers c ON s.customer_id = c.id
            WHERE s.owner_id = $1
            AND s.recorded_by = $2
            AND s.is_deleted = false
            ORDER BY s.sale_date DESC
        `,
        values: [ownerId, userId]
    };
};

// ============================================================
// Sales Items by Sale IDs — fetch items for user's filtered sales
// Source: salesController.js lines 25-41
// ============================================================
exports.getSaleItemsBySaleIds = (saleIds) => {
    return {
        text: `
            SELECT 
                si.sale_id,
                si.id as item_id,
                f.name as flavor,
                p.name as product_name,
                si.quantity as qty,
                si.price_charged,
                si.standard_price_snap,
                si.vendor_price_snap,
                si.product_version_id as stock_id
            FROM sale_items si
            LEFT JOIN product_versions pv ON si.product_version_id = pv.id
            LEFT JOIN products p ON pv.product_id = p.id
            LEFT JOIN flavours f ON si.flavour_id = f.id
            WHERE si.sale_id = ANY($1)
        `,
        values: [saleIds]
    };
};

// ============================================================
// All Sales Admin — full join query with items inline
// Source: salesService.js lines 7-28
// ============================================================
exports.getAllSalesAdmin = (ownerId, recordedById) => {
    let text = `
        SELECT 
            s.id as sale_id,
            s.sale_date as date,
            c.name as customer,
            u.email as recorded_by_email,
            si.id as item_id,
            f.name as flavor,
            p.name as product_name,
            si.quantity as qty,
            si.price_charged,
            si.standard_price_snap,
            si.vendor_price_snap,
            si.product_version_id as stock_id
        FROM sales s
        JOIN customers c ON s.customer_id = c.id
        JOIN users u ON s.recorded_by = u.id
        LEFT JOIN sale_items si ON si.sale_id = s.id
        LEFT JOIN product_versions pv ON si.product_version_id = pv.id
        LEFT JOIN products p ON pv.product_id = p.id
        LEFT JOIN flavours f ON si.flavour_id = f.id
        WHERE s.owner_id = $1 AND s.is_deleted = false
    `;
    
    const values = [ownerId];
    if (recordedById) {
        text += ` AND s.recorded_by = $2`;
        values.push(recordedById);
    }
    
    text += ` ORDER BY s.sale_date DESC, s.created_at DESC`;
    
    return { text, values };
};

// ============================================================
// Create Sale Atomic — calls PG stored procedure
// Source: salesService.js line 94-96
// ============================================================
exports.createSaleAtomic = (ownerId, customerId, date, recordedBy, itemsJson) => {
    return {
        text: `SELECT create_sale_atomic($1, $2, $3, $4, $5::jsonb) as sale_id`,
        values: [ownerId, customerId, date, recordedBy, JSON.stringify(itemsJson)]
    };
};

// ============================================================
// Delete Sale Restore Stock — calls PG stored procedure
// Source: salesService.js line 143-145
// ============================================================
exports.deleteSaleRestoreStock = (saleId, deletedBy, ownerId) => {
    return {
        text: `SELECT delete_sale_restore_stock($1, $2, $3) as success`,
        values: [saleId, deletedBy, ownerId]
    };
};

// ============================================================
// Admin Config — low stock threshold, discount alert
// Source: salesService.js line 108
// ============================================================
exports.getAdminConfig = (ownerId) => {
    return {
        text: `SELECT low_stock_threshold, discount_alert_pct FROM admin_config WHERE owner_id = $1`,
        values: [ownerId]
    };
};

// ============================================================
// Staff Email — recorder's name for notification context
// Source: salesService.js line 112
// ============================================================
exports.getStaffEmail = (recordedBy) => {
    return {
        text: `SELECT email FROM users WHERE id = $1`,
        values: [recordedBy]
    };
};

// ============================================================
// Customer Name — for notification context
// Source: salesService.js line 116
// ============================================================
exports.getCustomerName = (customerId) => {
    return {
        text: `SELECT name FROM customers WHERE id = $1`,
        values: [customerId]
    };
};

// ============================================================
// Remaining Stock — post-sale notification check
// Source: salesService.js line 121
// ============================================================
exports.getRemainingStock = (productVersionId, ownerId) => {
    return {
        text: `SELECT quantity FROM stock WHERE product_version_id = $1 AND owner_id = $2`,
        values: [productVersionId, ownerId]
    };
};

// ============================================================
// Product Name — for notification title
// Source: salesService.js lines 123-125
// ============================================================
exports.getProductName = (productVersionId) => {
    return {
        text: `SELECT p.name FROM products p JOIN product_versions pv ON pv.product_id = p.id WHERE pv.id = $1`,
        values: [productVersionId]
    };
};

// ============================================================
// Check Sale Permission — user delete permission check
// Source: salesController.js line 143
// ============================================================
exports.checkSalePermission = (saleId, ownerId) => {
    return {
        text: `SELECT recorded_by FROM sales WHERE id = $1 AND owner_id = $2 AND is_deleted = false`,
        values: [saleId, ownerId]
    };
};

// ============================================================
// Get Sale Item — for deleteSaleItemTransaction
// Source: salesService.js lines 161-166
// ============================================================
exports.getSaleItem = (itemId, ownerId) => {
    return {
        text: `
            SELECT si.sale_id, si.quantity, si.product_version_id, s.recorded_by
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            WHERE si.id = $1 AND s.owner_id = $2 AND s.is_deleted = false
        `,
        values: [itemId, ownerId]
    };
};

// ============================================================
// Count Sale Items — check if last item
// Source: salesService.js line 180
// ============================================================
exports.countSaleItems = (saleId) => {
    return {
        text: `SELECT count(*) FROM sale_items WHERE sale_id = $1`,
        values: [saleId]
    };
};

// ============================================================
// Delete Sale Item Row
// Source: salesService.js line 190
// ============================================================
exports.deleteSaleItemRow = (itemId) => {
    return {
        text: `DELETE FROM sale_items WHERE id = $1`,
        values: [itemId]
    };
};

// ============================================================
// Restore Item Stock — manual stock restoration
// Source: salesService.js lines 193-197
// ============================================================
exports.restoreItemStock = (quantity, productVersionId, ownerId) => {
    return {
        text: `
            UPDATE stock 
            SET quantity = quantity + $1 
            WHERE product_version_id = $2 AND owner_id = $3
        `,
        values: [quantity, productVersionId, ownerId]
    };
};
