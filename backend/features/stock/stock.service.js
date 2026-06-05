const db = require('../../shared/db/connection');
const audit = require('../../shared/services/auditLogService');
const queries = require('./stock.queries');

exports.getStock = async (ownerId) => {
    const query = queries.fetchStock(ownerId);
    const result = await db.query(query.text, query.values);
    
    return result.rows.map(row => ({
        id: `${row.version_id}_${row.flavour_id || 'none'}`, // Map for frontend AddSale dropdowns (unique)
        version_id: row.version_id,
        flavour_id: row.flavour_id,
        stock_id: row.stock_id,
        product_id: row.product_id,
        product_name: row.product_name,
        flavor: row.flavor,
        vendor_price: row.vendor_price / 100, // Convert to Rupee for frontend
        vp: row.volume_points, // V.P (Volume Points)
        qty: row.qty
    }));
};

exports.addStock = async (ownerId, variantId, quantity, userId) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Check if version belongs to owner and is active
        const pvQuery = queries.verifyProductOwnership(variantId, ownerId);
        const pvRes = await client.query(pvQuery.text, pvQuery.values);

        if (pvRes.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            throw new Error("Product version not found or inactive");
        }

        const vendorPriceSnap = pvRes.rows[0].vendor_price;

        // Try to update existing stock row
        const updateQuery = queries.updateStockRow(quantity, vendorPriceSnap, variantId, ownerId);
        const updateRes = await client.query(updateQuery.text, updateQuery.values);

        if (updateRes.rows.length === 0) {
            // No existing row, insert new
            const insertQuery = queries.insertStockRow(variantId, ownerId, quantity, vendorPriceSnap, userId);
            await client.query(insertQuery.text, insertQuery.values);
        }

        await client.query('COMMIT');
        client.release();
        
        await audit.logAction(userId, 'STOCK_ADD', 'stock', null, null, { product_version_id: variantId, quantity_added: quantity });
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
            client.release();
        }
        throw error;
    }
};

exports.updateStockQuantity = async (ownerId, stockId, quantity, userId) => {
    const query = queries.updateStockQuantityRow(quantity, stockId, ownerId);
    const result = await db.query(query.text, query.values);
    
    if (result.rows.length === 0) {
        throw new Error("Stock not found");
    }
    
    await audit.logAction(userId, 'STOCK_UPDATE', 'stock', stockId, null, { new_quantity: quantity });
};

exports.deleteStock = async (ownerId, stockId, userId) => {
    const query = queries.deleteStockRow(stockId, ownerId);
    await db.query(query.text, query.values);
    
    await audit.logAction(userId, 'STOCK_DELETE', 'stock', stockId);
};
