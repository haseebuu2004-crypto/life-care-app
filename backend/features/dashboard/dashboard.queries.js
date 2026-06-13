// ============================================================
// Get Admin Config
// Source: dashboardController.js line 58
// ============================================================
exports.getAdminConfig = (ownerId) => {
    return {
        text: `SELECT low_stock_threshold, setup_completed, default_shake_amount FROM admin_config WHERE owner_id = $1`,
        values: [ownerId]
    };
};

// ============================================================
// Get Dashboard Scalars (5-way analytics query)
// Source: dashboardController.js lines 67-74
// ============================================================
exports.getDashboardPeriodScalars = (ownerId, startDate, endDate) => {
    return {
        text: `
            SELECT 
                (SELECT COALESCE(SUM((si.price_charged::integer - si.vendor_price_snap::integer) * si.quantity::integer), 0) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.owner_id = $1 AND s.sale_date >= $2 AND s.sale_date <= $3 AND s.is_deleted = false) as "totalSalesProfit",
                (SELECT COALESCE(SUM(si.price_charged::integer * si.quantity::integer), 0) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.owner_id = $1 AND s.sale_date >= $2 AND s.sale_date <= $3 AND s.is_deleted = false) as "totalSalesRevenue",
                (SELECT COALESCE(SUM(shake_amount::integer), 0) FROM attendance WHERE owner_id = $1 AND attendance_date >= $2 AND attendance_date <= $3 AND is_deleted = false) as "totalShakeProfit"
        `,
        values: [ownerId, startDate, endDate]
    };
};

exports.getDashboardPitScalars = (ownerId) => {
    return {
        text: `
            SELECT 
                (SELECT COALESCE(SUM(s.quantity::integer * pv.vendor_price::integer), 0) FROM stock s JOIN product_versions pv ON s.product_version_id = pv.id JOIN variants v ON s.variant_id = v.id WHERE s.owner_id = $1 AND pv.is_active = true AND v.is_active = true) as "totalStockVpValue",
                (SELECT COUNT(*) FROM stock s JOIN variants v ON s.variant_id = v.id JOIN product_versions pv ON s.product_version_id = pv.id WHERE s.owner_id = $1 AND s.quantity <= v.low_stock_threshold AND v.alert_enabled = true AND pv.is_active = true AND v.is_active = true) as "lowStock"
        `,
        values: [ownerId]
    };
};

// ============================================================
// Get Low Stock Items
// Source: dashboardController.js lines 78-85
// ============================================================
exports.getLowStockItems = (ownerId) => {
    return {
        text: `
            SELECT s.id, 
                   CASE WHEN v.name != 'Base' THEN p.name || ' | ' || v.name ELSE p.name END as product_name, 
                   s.quantity as qty
            FROM stock s
            JOIN variants v ON s.variant_id = v.id
            JOIN product_versions pv ON s.product_version_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE s.quantity <= v.low_stock_threshold 
              AND v.alert_enabled = true 
              AND s.owner_id = $1 
              AND pv.is_active = true
              AND v.is_active = true
            ORDER BY s.quantity ASC
        `,
        values: [ownerId]
    };
};

// ============================================================
// Get Monthly Product Sales
// Source: dashboardController.js lines 86-95
// ============================================================
exports.getMonthlyProductSales = (ownerId, startDate, endDate) => {
    return {
        text: `
            SELECT 
                CASE WHEN v.name != 'Base' THEN p.name || ' | ' || v.name ELSE p.name END as name, 
                SUM(si.quantity::integer) as qty
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            JOIN variants v ON si.variant_id = v.id
            JOIN product_versions pv ON si.product_version_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE s.sale_date >= $1 AND s.sale_date <= $3 AND s.owner_id = $2 AND s.is_deleted = false
            GROUP BY p.name, v.name
            ORDER BY qty DESC
        `,
        values: [startDate, ownerId, endDate]
    };
};

// ============================================================
// Get Top Customers
// Source: dashboardController.js lines 96-105
// ============================================================
exports.getTopCustomers = (ownerId, startDate, endDate) => {
    return {
        text: `
            SELECT c.name, COALESCE(SUM((si.price_charged::integer - si.vendor_price_snap::integer) * si.quantity::integer), 0) as profit
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            JOIN customers c ON s.customer_id = c.id
            WHERE s.owner_id = $1 AND s.sale_date >= $2 AND s.sale_date <= $3 AND s.is_deleted = false
            GROUP BY c.name
            ORDER BY profit DESC
            LIMIT 10
        `,
        values: [ownerId, startDate, endDate]
    };
};

// ============================================================
// Get Shake Profit Details
// Source: dashboardController.js lines 106-113
// ============================================================
exports.getShakeProfitDetails = (ownerId, startDate, endDate) => {
    return {
        text: `
            SELECT c.name, COUNT(*) as attendance, AVG(a.shake_amount) as "profitPerDay", SUM(a.shake_amount) as "totalProfit"
            FROM attendance a
            JOIN customers c ON a.customer_id = c.id
            WHERE a.owner_id = $1 AND a.attendance_date >= $2 AND a.attendance_date <= $3 AND a.is_deleted = false
            GROUP BY c.name
            ORDER BY "totalProfit" DESC
        `,
        values: [ownerId, startDate, endDate]
    };
};

// ============================================================
// Get Active Sales For Deletion
// Source: dashboardController.js line 154
// ============================================================
exports.getActiveSales = (ownerId) => {
    return {
        text: `SELECT id FROM sales WHERE owner_id = $1 AND is_deleted = false`,
        values: [ownerId]
    };
};

// ============================================================
// Delete Sale Restore Stock Atomic
// Source: dashboardController.js line 156
// ============================================================
exports.deleteSaleRestoreStock = (saleId, deletedBy, ownerId) => {
    return {
        text: `SELECT delete_sale_restore_stock($1, $2, $3)`,
        values: [saleId, deletedBy, ownerId]
    };
};

// ============================================================
// Soft Delete Attendance
// Source: dashboardController.js line 160
// ============================================================
exports.softDeleteAttendance = (ownerId) => {
    return {
        text: `UPDATE attendance SET is_deleted = true, deleted_at = NOW() WHERE owner_id = $1`,
        values: [ownerId]
    };
};

// ============================================================
// Deactivate User Accounts
// Source: dashboardController.js line 190
// ============================================================
exports.deactivateUserAccounts = (ownerId) => {
    return {
        text: `UPDATE users SET is_active = false WHERE id = $1 OR owner_id = $1`,
        values: [ownerId]
    };
};

// ============================================================
// Invalidate Sessions
// Source: dashboardController.js line 191
// ============================================================
exports.invalidateUserSessions = (ownerId) => {
    return {
        text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id IN (SELECT id FROM users WHERE id = $1 OR owner_id = $1)`,
        values: [ownerId]
    };
};

// ============================================================
// Complete Setup
// Source: dashboardController.js line 214
// ============================================================
exports.completeSetup = (ownerId) => {
    return {
        text: `UPDATE admin_config SET setup_completed = true WHERE owner_id = $1`,
        values: [ownerId]
    };
};

// ============================================================
// Get Deleted Attendance Records
// Source: dashboardController.js lines 458-463
// ============================================================
exports.getDeletedAttendance = (ownerId) => {
    return {
        text: `
            SELECT a.id, 'Attendance' as category, a.shake_amount as value, a.deleted_at, a.attendance_date as original_date, c.name as customer_name
            FROM attendance a
            LEFT JOIN customers c ON a.customer_id = c.id
            WHERE a.owner_id = $1 AND a.is_deleted = true
        `,
        values: [ownerId]
    };
};

// ============================================================
// Get Deleted Sales Records
// Source: dashboardController.js lines 466-477
// ============================================================
exports.getDeletedSales = (ownerId) => {
    return {
        text: `
            SELECT 
                s.id, 
                'Sale' as category, 
                (SELECT COALESCE(SUM((si.price_charged::integer - si.vendor_price_snap::integer) * si.quantity::integer), 0) FROM sale_items si WHERE si.sale_id = s.id) as value, 
                s.deleted_at, 
                s.sale_date as original_date, 
                c.name as customer_name
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            WHERE s.owner_id = $1 AND s.is_deleted = true
        `,
        values: [ownerId]
    };
};

// ============================================================
// Restore Attendance Record
// Source: dashboardController.js line 508
// ============================================================
exports.restoreAttendance = (attendanceId, ownerId) => {
    return {
        text: `UPDATE attendance SET is_deleted = false, deleted_at = null WHERE id = $1 AND owner_id = $2`,
        values: [attendanceId, ownerId]
    };
};

// ============================================================
// Get Sale Items for Restoration Check
// Source: dashboardController.js line 511
// ============================================================
exports.getSaleItemsForRestore = (saleId) => {
    return {
        text: `SELECT product_version_id, variant_id, quantity FROM sale_items WHERE sale_id = $1`,
        values: [saleId]
    };
};

// ============================================================
// Get Stock for Restoration Check
// Source: dashboardController.js line 514
// ============================================================
exports.getStockForRestore = (productVersionId, variantId, ownerId) => {
    return {
        text: `SELECT quantity FROM stock WHERE product_version_id = $1 AND variant_id = $2 AND owner_id = $3`,
        values: [productVersionId, variantId, ownerId]
    };
};

// ============================================================
// Deduct Stock For Restoration
// Source: dashboardController.js line 522
// ============================================================
exports.deductStockForRestore = (quantity, productVersionId, variantId, ownerId) => {
    return {
        text: `UPDATE stock SET quantity = quantity - $1 WHERE product_version_id = $2 AND variant_id = $3 AND owner_id = $4`,
        values: [quantity, productVersionId, variantId, ownerId]
    };
};

// ============================================================
// Restore Sale Record
// Source: dashboardController.js line 524
// ============================================================
exports.restoreSale = (saleId, ownerId) => {
    return {
        text: `UPDATE sales SET is_deleted = false, deleted_at = null WHERE id = $1 AND owner_id = $2`,
        values: [saleId, ownerId]
    };
};

// ============================================================
// Get User Password Hash (OTP check)
// Source: dashboardController.js line 346 & 402
// ============================================================
exports.getUserPasswordHash = (userId) => {
    return {
        text: `SELECT password_hash FROM users WHERE id = $1`,
        values: [userId]
    };
};
