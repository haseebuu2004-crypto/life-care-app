const db = require('../db');
const audit = require('./auditLogService');
const cache = require('./cacheService');

exports.getAllSales = async (ownerId, recordedById = null) => {
    // We want to return Sales, with their items grouped inside
    let query = `
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
    
    const params = [ownerId];
    if (recordedById) {
        query += ` AND s.recorded_by = $2`;
        params.push(recordedById);
    }
    
    query += ` ORDER BY s.sale_date DESC, s.created_at DESC`;
    
    const res = await db.query(query, params);

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
                product_name: row.product_name,
                flavor: row.flavor || 'Base',
                qty: row.qty,
                sale_price: salePrice,
                standard_price: standardPrice,
                vendor_price: vendorPrice,
                profit: profit
            });
        }
    });

    return Array.from(salesMap.values());
};

exports.addSaleTransaction = async (date, customerId, uniqueItems, ownerId, recordedBy) => {
    const itemsJson = uniqueItems.map(p => ({
        product_version_id: p.product_version_id,
        flavour_id: p.flavour_id || null,
        quantity: parseInt(p.quantity) || 0,
        price_charged: parseInt(p.price_charged) || 0,
        standard_price_snap: parseInt(p.standard_price_snap) || 0,
        vendor_price_snap: parseInt(p.vendor_price_snap) || 0
    }));

    try {
        const res = await db.query(`
            SELECT create_sale_atomic($1, $2, $3, $4, $5::jsonb) as sale_id
        `, [ownerId, customerId, date, recordedBy, JSON.stringify(itemsJson)]);
        
        const saleId = res.rows[0].sale_id;
        
        const isBackdated = date !== new Date().toISOString().split('T')[0];
        const logAction = isBackdated ? 'SALE_CREATE_BACKDATED' : 'SALE_CREATE';
        
        await audit.logAction(recordedBy, logAction, 'sales', saleId);
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);

        // Check for notifications
        const notifService = require('./notificationService');
        const configRes = await db.query(`SELECT low_stock_threshold, discount_alert_pct FROM admin_config WHERE owner_id = $1`, [ownerId]);
        const config = configRes.rows[0] || { low_stock_threshold: 10, discount_alert_pct: 30 };

        // Fetch staff / recorder's name
        const userRes = await db.query(`SELECT email FROM users WHERE id = $1`, [recordedBy]);
        const staffName = userRes.rows[0]?.email ? userRes.rows[0].email.split('@')[0] : 'Staff';

        // Fetch customer's name
        const custRes = await db.query(`SELECT name FROM customers WHERE id = $1`, [customerId]);
        const customerName = custRes.rows[0]?.name || 'Customer';

        for (const p of itemsJson) {
            // Check stock remaining
            const stockRes = await db.query(`SELECT quantity FROM stock WHERE product_version_id = $1 AND owner_id = $2`, [p.product_version_id, ownerId]);
            const remaining = stockRes.rows[0]?.quantity || 0;
            const productNameRes = await db.query(`
                SELECT p.name FROM products p JOIN product_versions pv ON pv.product_id = p.id WHERE pv.id = $1
            `, [p.product_version_id]);
            const prodName = productNameRes.rows[0]?.name || 'Product';

            if (remaining === 0) {
                await notifService.createNotification(ownerId, 'out_of_stock', `${prodName} is out of stock`, `All units have been sold. Add stock to continue selling.`, { product_name: prodName }, true);
            } else if (remaining <= config.low_stock_threshold) {
                await notifService.createNotification(ownerId, 'low_stock', `${prodName} is running low`, `Only ${remaining} units remaining. Consider restocking soon.`, { product_name: prodName, quantity: remaining }, false);
            }
        }
    } catch (e) {
        if (e.message.includes('INSUFFICIENT_STOCK')) {
            throw new Error('Insufficient stock');
        }
        throw e;
    }
};

exports.deleteSaleTransaction = async (saleId, ownerId, deletedBy) => {
    const res = await db.query(`
        SELECT delete_sale_restore_stock($1, $2, $3) as success
    `, [saleId, deletedBy, ownerId]);
    
    if (!res.rows[0].success) {
        throw new Error("Sale not found or already deleted");
    }

    await audit.logAction(deletedBy, 'SALE_DELETE', 'sales', saleId);
    await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
};

exports.deleteSaleItemTransaction = async (itemId, ownerId, userId, userRole) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Get the item and its parent sale
        const itemRes = await client.query(`
            SELECT si.sale_id, si.quantity, si.product_version_id, s.recorded_by
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            WHERE si.id = $1 AND s.owner_id = $2 AND s.is_deleted = false
        `, [itemId, ownerId]);
        
        if (itemRes.rows.length === 0) {
            throw new Error("Sale item not found or already deleted");
        }
        
        const item = itemRes.rows[0];
        
        // 2. Permission check
        if (userRole !== 'admin' && item.recorded_by !== userId) {
            throw new Error("You don't have permission to delete this sale item.");
        }
        
        // 3. Count remaining items in the sale
        const countRes = await client.query(`SELECT count(*) FROM sale_items WHERE sale_id = $1`, [item.sale_id]);
        const count = parseInt(countRes.rows[0].count);
        
        if (count <= 1) {
            // It's the last item, just delete the entire sale
            await client.query('ROLLBACK');
            return exports.deleteSaleTransaction(item.sale_id, ownerId, userId);
        }
        
        // 4. Delete the item
        await client.query(`DELETE FROM sale_items WHERE id = $1`, [itemId]);
        
        // 5. Restore stock
        await client.query(`
            UPDATE stock 
            SET quantity = quantity + $1 
            WHERE product_version_id = $2 AND owner_id = $3
        `, [item.quantity, item.product_version_id, ownerId]);
        
        await client.query('COMMIT');
        
        await audit.logAction(userId, 'SALE_ITEM_DELETE', 'sale_items', itemId);
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
