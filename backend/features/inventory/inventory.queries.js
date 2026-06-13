const db = require('../../shared/db/connection');

exports.getInventoryEntities = (ownerId) => {
    // We join products, active product_versions, variants, and stock
    // To prevent N+1 queries and get all data in one go.
    return db.query(`
        SELECT 
            v.id AS variant_id,
            p.id AS product_id,
            pv.id AS product_version_id,
            p.name AS product_name,
            v.name AS variant_name,
            v.sku,
            pv.vendor_price,
            pv.volume_points,
            v.is_active,
            v.low_stock_threshold,
            v.alert_enabled,
            COALESCE(s.quantity, 0) AS stock_quantity,
            s.id AS stock_id
        FROM variants v
        JOIN product_versions pv ON pv.id = v.product_version_id
        JOIN products p ON p.id = pv.product_id
        LEFT JOIN stock s ON s.variant_id = v.id
        WHERE p.owner_id = $1 
          AND pv.is_active = true
        ORDER BY p.name ASC, v.name ASC
    `, [ownerId]);
};

exports.searchInventoryEntities = (ownerId, searchQuery) => {
    return db.query(`
        SELECT 
            v.id AS variant_id,
            p.id AS product_id,
            pv.id AS product_version_id,
            p.name AS product_name,
            v.name AS variant_name,
            v.sku,
            pv.vendor_price,
            pv.volume_points,
            v.is_active,
            v.low_stock_threshold,
            v.alert_enabled,
            COALESCE(s.quantity, 0) AS stock_quantity,
            s.id AS stock_id
        FROM variants v
        JOIN product_versions pv ON pv.id = v.product_version_id
        JOIN products p ON p.id = pv.product_id
        LEFT JOIN stock s ON s.variant_id = v.id
        WHERE p.owner_id = $1 
          AND pv.is_active = true
          AND (
              p.name ILIKE $2 
              OR v.name ILIKE $2 
              OR v.sku ILIKE $2
          )
        ORDER BY p.name ASC, v.name ASC
    `, [ownerId, `%${searchQuery}%`]);
};

exports.getVariantById = (variantId, ownerId) => {
    return db.query(`
        SELECT 
            v.id AS variant_id,
            p.id AS product_id,
            pv.id AS product_version_id,
            p.name AS product_name,
            v.name AS variant_name,
            v.sku,
            pv.vendor_price,
            pv.volume_points,
            v.is_active,
            v.low_stock_threshold,
            v.alert_enabled,
            COALESCE(s.quantity, 0) AS stock_quantity,
            s.id AS stock_id
        FROM variants v
        JOIN product_versions pv ON pv.id = v.product_version_id
        JOIN products p ON p.id = pv.product_id
        LEFT JOIN stock s ON s.variant_id = v.id
        WHERE v.id = $1 AND p.owner_id = $2
    `, [variantId, ownerId]);
};

exports.updateVariant = (variantId, data) => {
    const fields = [];
    const values = [];
    let queryIdx = 1;

    if (data.sku !== undefined) {
        fields.push(`sku = $${queryIdx++}`);
        values.push(data.sku);
    }
    if (data.is_active !== undefined) {
        fields.push(`is_active = $${queryIdx++}`);
        values.push(data.is_active);
    }
    if (data.low_stock_threshold !== undefined) {
        fields.push(`low_stock_threshold = $${queryIdx++}`);
        values.push(data.low_stock_threshold);
    }
    if (data.alert_enabled !== undefined) {
        fields.push(`alert_enabled = $${queryIdx++}`);
        values.push(data.alert_enabled);
    }

    if (fields.length === 0) return Promise.resolve({ rowCount: 0 });

    values.push(variantId);
    
    return db.query(`
        UPDATE variants 
        SET ${fields.join(', ')} 
        WHERE id = $${queryIdx}
        RETURNING *
    `, values);
};

exports.checkDuplicateSku = (sku, excludeVariantId) => {
    if (excludeVariantId) {
        return db.query(`SELECT id FROM variants WHERE sku = $1 AND id != $2`, [sku, excludeVariantId]);
    }
    return db.query(`SELECT id FROM variants WHERE sku = $1`, [sku]);
};
