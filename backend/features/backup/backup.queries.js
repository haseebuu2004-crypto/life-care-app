// ============================================================
// Backup Logs & Config Queries
// ============================================================
exports.getClubName = (ownerId) => ({
    text: `SELECT club_name FROM admin_config WHERE owner_id = $1`,
    values: [ownerId]
});

exports.insertBackupLogCloud = (ownerId, type, fileName, fileUrl, fileSize, createdBy, notes) => ({
    text: `
        INSERT INTO backup_logs 
        (owner_id, backup_type, file_name, storage_provider, file_url, file_size, status, created_by, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    values: [ownerId, type, fileName, 'GoogleDrive', fileUrl, fileSize, 'Success', createdBy, notes]
});

exports.insertBackupLogLocal = (ownerId, type, fileName, fileSize, createdBy, notes) => ({
    text: `
        INSERT INTO backup_logs 
        (owner_id, backup_type, file_name, storage_provider, file_size, status, created_by, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    values: [ownerId, type, fileName, 'Local Download', fileSize, 'Success', createdBy, notes]
});

exports.getBackupLogs = (ownerId) => ({
    text: `SELECT * FROM backup_logs WHERE owner_id = $1 ORDER BY created_at DESC LIMIT 50`,
    values: [ownerId]
});

exports.getRestoreLimitCount = (ownerId) => ({
    text: `
        SELECT COUNT(*) FROM backup_logs 
        WHERE owner_id = $1 
        AND restore_status = 'Restored' 
        AND DATE(restore_at) = CURRENT_DATE
    `,
    values: [ownerId]
});

exports.logRestoreSuccess = (ownerId, type, fileName, createdBy, strategy) => ({
    text: `
        INSERT INTO backup_logs 
        (owner_id, backup_type, file_name, storage_provider, status, created_by, restore_status, restore_at, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
    `,
    values: [ownerId, type, fileName, 'Upload', 'Success', createdBy, 'Restored', `Restore Strategy: ${strategy}`]
});

// ============================================================
// Export Queries
// ============================================================
exports.getExportCustomers = (ownerId) => ({
    text: `SELECT id, owner_id, name, phone, member_code, joined_at as date, is_active, created_at FROM customers WHERE owner_id = $1`,
    values: [ownerId]
});

exports.getExportAttendance = (ownerId) => ({
    text: `SELECT id, owner_id, customer_id, attendance_date, type, (shake_amount::numeric / 100.0)::float as shake_amount, recorded_by, created_at, is_deleted, deleted_at FROM attendance WHERE owner_id = $1`,
    values: [ownerId]
});

exports.getExportSales = (ownerId) => ({
    text: `SELECT id, owner_id, customer_id, sale_date, created_at, recorded_by, is_deleted, deleted_at, deleted_by FROM sales WHERE owner_id = $1`,
    values: [ownerId]
});

exports.getExportSaleItems = (ownerId) => ({
    text: `SELECT si.id, si.sale_id, si.product_version_id, si.variant_id, si.quantity, (si.price_charged::numeric / 100.0)::float as price_charged, (si.standard_price_snap::numeric / 100.0)::float as standard_price_snap, (si.vendor_price_snap::numeric / 100.0)::float as vendor_price_snap FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.owner_id = $1`,
    values: [ownerId]
});

exports.getExportProducts = (ownerId) => ({
    text: `SELECT id, owner_id, name, created_at FROM products WHERE owner_id = $1`,
    values: [ownerId]
});

exports.getExportProductVersions = (ownerId) => ({
    text: `SELECT pv.id, pv.product_id, (pv.vendor_price::numeric / 100.0)::float as vendor_price, pv.volume_points, pv.version_label, pv.is_active, pv.effective_from, pv.effective_to, pv.created_by FROM product_versions pv JOIN products p ON pv.product_id = p.id WHERE p.owner_id = $1`,
    values: [ownerId]
});

exports.getExportVariants = (ownerId) => ({
    text: `SELECT id, product_version_id, owner_id, name, is_active, created_at, sku, low_stock_threshold, alert_enabled FROM variants WHERE owner_id = $1`,
    values: [ownerId]
});

exports.getExportStock = (ownerId) => ({
    text: `SELECT id, owner_id, product_version_id, variant_id, quantity, (vendor_price_snap::numeric / 100.0)::float as vendor_price_snap, added_at, added_by FROM stock WHERE owner_id = $1`,
    values: [ownerId]
});

// ============================================================
// Differential Merge Queries
// ============================================================
exports.getSaleItemsSnapshot = (ownerId) => ({
    text: `
        SELECT si.variant_id, SUM(si.quantity) as qty
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE s.owner_id = $1 AND s.is_deleted = false
        GROUP BY si.variant_id
    `,
    values: [ownerId]
});

exports.updateStockDifferential = (diff, variantId, ownerId) => ({
    text: `
        UPDATE stock 
        SET quantity = quantity - $1 
        WHERE variant_id = $2 AND owner_id = $3
    `,
    values: [diff, variantId, ownerId]
});

// ============================================================
// Wipe Queries
// ============================================================
exports.deleteSaleItemsWipe = (ownerId) => ({
    text: `DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE owner_id = $1)`,
    values: [ownerId]
});

exports.deleteProductVersionsWipe = (ownerId) => ({
    text: `DELETE FROM product_versions WHERE product_id IN (SELECT id FROM products WHERE owner_id = $1)`,
    values: [ownerId]
});

exports.deleteTableWipe = (tableName, ownerId) => ({
    text: `DELETE FROM ${tableName} WHERE owner_id = $1`,
    values: [ownerId]
});

// Dynamic insert query builders
exports.buildMergeInsertQuery = (tableName, dbColumns) => {
    const placeholders = dbColumns.map((_, i) => `$${i + 1}`).join(', ');
    const colNames = dbColumns.join(', ');
    const updateSet = dbColumns.filter(c => c !== 'id').map(c => `${c} = EXCLUDED.${c}`).join(', ');
    return `
        INSERT INTO ${tableName} (${colNames}) 
        VALUES (${placeholders}) 
        ON CONFLICT (id) DO UPDATE SET ${updateSet}
    `;
};

exports.buildStandardInsertQuery = (tableName, dbColumns) => {
    const placeholders = dbColumns.map((_, i) => `$${i + 1}`).join(', ');
    const colNames = dbColumns.join(', ');
    return `INSERT INTO ${tableName} (${colNames}) VALUES (${placeholders})`;
};
