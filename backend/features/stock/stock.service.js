const db = require('../../shared/db/connection');
const audit = require('../../shared/services/auditLogService');
const cache = require('../../shared/services/cacheService');
const queries = require('./stock.queries');

exports.getStock = async (ownerId) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {

        const query = queries.fetchStock(ownerId);
        const result = await db.query(query.text, query.values);
        
        if (!result || !result.rows || result.rows.length === 0) {
            return [];
        }
        
        return result.rows.map(row => ({
            id: `${row.version_id}_${row.variant_id || 'none'}`, // Map for frontend AddSale dropdowns (unique)
            version_id: row.version_id,
            flavour_id: row.variant_id, // For backward compatibility with frontend
            stock_id: row.stock_id,
            product_id: row.product_id,
            product_name: row.product_name,
            version_label: row.version_label,
            flavor: row.flavor,
            vendor_price: row.vendor_price ? row.vendor_price / 100 : 0, // Convert to Rupee for frontend
            vp: row.volume_points, // V.P (Volume Points)
            qty: row.qty || 0
        }));
    } catch (error) {
        console.error("getStock Error:", error);
        throw error;
    }
};

exports.addStock = async (ownerId, variantId, quantity, userId) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Check if variant belongs to owner and product has active version
        const pvQuery = queries.verifyProductOwnership(variantId, ownerId);
        const pvRes = await client.query(pvQuery.text, pvQuery.values);

        if (pvRes.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            throw new Error("Variant not found or product version is inactive");
        }

        const vendorPriceSnap = pvRes.rows[0].vendor_price;
        const versionId = pvRes.rows[0].version_id;

        // Try to update existing stock row
        const updateQuery = queries.updateStockRow(quantity, vendorPriceSnap, variantId, versionId, ownerId);
        const updateRes = await client.query(updateQuery.text, updateQuery.values);

        if (updateRes.rows.length === 0) {
        // No existing row, insert new
        const insertQuery = queries.insertStockRow(variantId, versionId, ownerId, quantity, vendorPriceSnap, userId);
        await client.query(insertQuery.text, insertQuery.values);
    }

    await client.query('COMMIT');
    await audit.logAction(userId, 'STOCK_ADD', 'stock', null, null, { product_version_id: versionId, variant_id: variantId, quantity_added: quantity });
    await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
    await cache.invalidateCachePattern(`inventory_entities:${ownerId}`);
} catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error("addStock Error:", error);
    throw error;
} finally {
    if (client) client.release();
}
};

exports.updateStockQuantity = async (ownerId, variantId, quantity, userId) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        const query = queries.updateStockQuantityRow(quantity, variantId, ownerId);
        const result = await db.query(query.text, query.values);
        
        if (!result || !result.rows || result.rows.length === 0) {
            throw new Error("Stock not found");
        }
        
        await audit.logAction(userId, 'STOCK_UPDATE', 'stock', variantId, null, { new_quantity: quantity });
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
        await cache.invalidateCachePattern(`inventory_entities:${ownerId}`);
    } catch (error) {
        console.error("updateStockQuantity Error:", error);
        throw error;
    }
};

exports.deleteStock = async (ownerId, variantId, userId) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        const query = queries.deleteStockRow(variantId, ownerId);
        await db.query(query.text, query.values);
        
        await audit.logAction(userId, 'STOCK_DELETE', 'stock', variantId);
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
        await cache.invalidateCachePattern(`inventory_entities:${ownerId}`);
    } catch (error) {
        console.error("deleteStock Error:", error);
        throw error;
    }
};
