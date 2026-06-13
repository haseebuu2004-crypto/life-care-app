const db = require('../../shared/db/connection');
const audit = require('../../shared/services/auditLogService');
const cache = require('../../shared/services/cacheService');
const queries = require('./sales.queries');

exports.getAllSales = async (ownerId, recordedById = null) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        const query = queries.getAllSalesAdmin(ownerId, recordedById);
        const res = await db.query(query.text, query.values);
        
        if (!res || !res.rows) return [];

        const salesMap = new Map();
        
        res.rows.forEach(row => {
            if (!salesMap.has(row.sale_id)) {
                salesMap.set(row.sale_id, {
                    id: row.sale_id,
                    date: row.date,
                    customer: row.customer,
                    recorded_by: row.recorded_by_email,
                    total_amount: 0,
                    total_profit: 0,
                    items: []
                });
            }
            
            const sale = salesMap.get(row.sale_id);
            
            if (row.item_id) {
                const salePrice = row.price_charged / 100;
                const vendorPrice = row.vendor_price_snap / 100;
                const standardPrice = row.standard_price_snap / 100;
                const profit = (salePrice - vendorPrice) * row.qty;
                
                sale.total_amount += (salePrice * row.qty);
                sale.total_profit += profit;
                
                sale.items.push({
                    item_id: row.item_id,
                    inventoryId: row.variant_id,
                    displayName: row.flavor && row.flavor !== 'Base' ? `${row.product_name} | ${row.flavor}` : row.product_name,
                    qty: row.qty,
                    sale_price: salePrice,
                    standard_price: standardPrice,
                    vendor_price: vendorPrice,
                    profit: profit
                });
            }
        });

        return Array.from(salesMap.values());
    } catch (error) {
        console.error('[SalesService] error:', error);
        throw error;
    }
};

exports.addSaleTransaction = async (date, customerId, uniqueItems, ownerId, recordedBy) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    
    const itemsJson = uniqueItems.map(p => ({
        product_version_id: p.product_version_id,
        variant_id: p.variant_id || p.flavour_id || null, // Support legacy flavour_id
        quantity: parseInt(p.quantity) || 0,
        price_charged: parseInt(p.price_charged) || 0,
        standard_price_snap: parseInt(p.standard_price_snap) || 0,
        vendor_price_snap: parseInt(p.vendor_price_snap) || 0
    }));

    try {
        const atomicQuery = queries.createSaleAtomic(ownerId, customerId, date, recordedBy, itemsJson);
        const res = await db.query(atomicQuery.text, atomicQuery.values);
        
        if (!res || !res.rows || res.rows.length === 0) {
            throw new Error("Failed to create sale transaction");
        }
        
        const saleId = res.rows[0].sale_id;
        
        const isBackdated = date !== new Date().toLocaleDateString('en-CA');
        const logAction = isBackdated ? 'SALE_CREATE_BACKDATED' : 'SALE_CREATE';
        
        await audit.logAction(recordedBy, logAction, 'sales', saleId);
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);

        // Check for notifications — lazy require to avoid circular dependency
        const notifService = require('../notifications/notifications.service');
        const configQuery = queries.getAdminConfig(ownerId);
        const configRes = await db.query(configQuery.text, configQuery.values);
        let config = configRes.rows[0] || {};
        
        if (config.low_stock_threshold === undefined || config.low_stock_threshold === null) {
            const sysRes = await db.query("SELECT value FROM settings WHERE key = 'SYSTEM_LOW_STOCK_THRESHOLD'");
            config.low_stock_threshold = sysRes.rows.length > 0 ? parseInt(sysRes.rows[0].value) : 10;
        }
        
        if (config.discount_alert_pct === undefined || config.discount_alert_pct === null) {
            config.discount_alert_pct = 30; // Original default
        }

        // Fetch staff / recorder's name
        const userQuery = queries.getStaffEmail(recordedBy);
        const userRes = await db.query(userQuery.text, userQuery.values);
        const staffName = userRes.rows[0]?.email ? userRes.rows[0].email.split('@')[0] : 'Staff';

        // Fetch customer's name
        const custQuery = queries.getCustomerName(customerId);
        const custRes = await db.query(custQuery.text, custQuery.values);
        const customerName = custRes.rows[0]?.name || 'Customer';

        for (const p of itemsJson) {
            // Check stock remaining
            const stockQuery = queries.getRemainingStock(p.product_version_id, p.variant_id, ownerId);
            const stockRes = await db.query(stockQuery.text, stockQuery.values);
            const remaining = stockRes.rows[0]?.quantity || 0;
            const prodNameQuery = queries.getProductName(p.product_version_id);
            const productNameRes = await db.query(prodNameQuery.text, prodNameQuery.values);
            const prodName = productNameRes.rows[0]?.name || 'Product';

            if (remaining === 0) {
                await notifService.createNotification(ownerId, 'out_of_stock', `${prodName} is out of stock`, `All units have been sold. Add stock to continue selling.`, { product_name: prodName }, true);
            } else if (remaining < config.low_stock_threshold) {
                await notifService.createNotification(ownerId, 'low_stock', `${prodName} is running low`, `Only ${remaining} units remaining. Consider restocking soon.`, { product_name: prodName, quantity: remaining }, false);
            }
        }
    } catch (e) {
        if (e.message.includes('INSUFFICIENT_STOCK')) {
            throw new Error('Insufficient stock');
        }
        console.error('[SalesService] error:', e);
        throw e;
    }
};

exports.deleteSaleTransaction = async (saleId, ownerId, deletedBy) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        const query = queries.deleteSaleRestoreStock(saleId, deletedBy, ownerId);
        const res = await db.query(query.text, query.values);
        
        if (!res || !res.rows || res.rows.length === 0 || !res.rows[0].success) {
            throw new Error("Sale not found or already deleted");
        }

        await audit.logAction(deletedBy, 'SALE_DELETE', 'sales', saleId);
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
    } catch (error) {
        console.error('[SalesService] error:', error);
        throw error;
    }
};

exports.deleteSaleItemTransaction = async (itemId, ownerId, userId, userRole) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Get the item and its parent sale
        const itemQuery = queries.getSaleItem(itemId, ownerId);
        const itemRes = await client.query(itemQuery.text, itemQuery.values);
        
        if (!itemRes || !itemRes.rows || itemRes.rows.length === 0) {
            throw new Error("Sale item not found or already deleted");
        }
        
        const item = itemRes.rows[0];
        
        // 2. Permission check
        if (userRole !== 'admin' && item.recorded_by !== userId) {
            throw new Error("You don't have permission to delete this sale item.");
        }
        
        // 3. Count remaining items in the sale
        const countQuery = queries.countSaleItems(item.sale_id);
        const countRes = await client.query(countQuery.text, countQuery.values);
        const count = parseInt(countRes.rows[0].count);
        
        if (count <= 1) {
            // It's the last item, just delete the entire sale
            await client.query('ROLLBACK');
            return exports.deleteSaleTransaction(item.sale_id, ownerId, userId);
        }
        
        // 4. Delete the item
        const deleteQuery = queries.deleteSaleItemRow(itemId);
        await client.query(deleteQuery.text, deleteQuery.values);
        
        // 5. Restore stock
        const restoreQuery = queries.restoreItemStock(item.quantity, item.product_version_id, item.variant_id, ownerId);
        await client.query(restoreQuery.text, restoreQuery.values);
        
        await client.query('COMMIT');
        
        await audit.logAction(userId, 'SALE_ITEM_DELETE', 'sale_items', itemId);
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('[SalesService] error:', error);
        throw error;
    } finally {
        if (client) client.release();
    }
};
