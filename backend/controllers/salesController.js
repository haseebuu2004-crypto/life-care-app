const salesService = require('../services/salesService');

const db = require('../db');

exports.getSales = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        
        if (req.user.role === 'user') {
            const query = `
                SELECT s.*, c.name as customer_name
                FROM sales s
                JOIN customers c ON s.customer_id = c.id
                WHERE s.owner_id = $1
                AND s.recorded_by = $2          -- $2 = req.user.id (UUID)
                AND s.is_deleted = false
                ORDER BY s.sale_date DESC
            `;
            const result = await db.query(query, [ownerId, req.user.id]);
            
            // Fetch items for these sales so the UI doesn't break
            const saleIds = result.rows.map(r => r.id);
            let items = [];
            if (saleIds.length > 0) {
                const itemsQuery = `
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
                `;
                const itemsRes = await db.query(itemsQuery, [saleIds]);
                items = itemsRes.rows;
            }
            
            // Map to the format the frontend expects
            const formatted = result.rows.map(r => {
                const saleItems = items.filter(it => it.sale_id === r.id);
                let totalAmount = 0;
                let totalProfit = 0;
                const formattedItems = saleItems.map(it => {
                    const salePrice = it.price_charged / 100;
                    const vendorPrice = it.vendor_price_snap / 100;
                    const standardPrice = it.standard_price_snap / 100;
                    const profit = (salePrice - vendorPrice) * it.qty;
                    totalAmount += (salePrice * it.qty);
                    totalProfit += profit;
                    return {
                        item_id: it.item_id,
                        product_name: it.product_name,
                        flavor: it.flavor || 'Base',
                        qty: it.qty,
                        sale_price: salePrice,
                        standard_price: standardPrice,
                        vendor_price: vendorPrice,
                        profit: profit
                    };
                });
                return {
                    id: r.id,
                    date: r.sale_date,
                    customer: r.customer_name,
                    recorded_by: req.user.email || r.recorded_by,
                    total_amount: totalAmount,
                    total_profit: totalProfit,
                    items: formattedItems
                };
            });
            return res.json({ success: true, data: formatted });
        } else {
            const rows = await salesService.getAllSales(ownerId);
            res.json({ success: true, data: rows });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addSale = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const recordedBy = req.user.id;
        let { customer_id, customer_name, sale_date, items } = req.body;
        
        if (!customer_id && customer_name) {
            const existing = await db.query(`SELECT id FROM customers WHERE owner_id = $1 AND name ILIKE $2`, [ownerId, customer_name.trim()]);
            if (existing.rows.length > 0) {
                customer_id = existing.rows[0].id;
            } else {
                const newCust = await db.query(`INSERT INTO customers (owner_id, name) VALUES ($1, $2) RETURNING id`, [ownerId, customer_name.trim()]);
                customer_id = newCust.rows[0].id;
            }
        }

        if (!customer_id) return res.status(400).json({ success: false, message: "Valid customer is required" });
        if (!items || items.length === 0) return res.status(400).json({ success: false, message: "No items provided" });
        
        // Aggregate identical products based on product_version_id and flavour_id
        const mergedItems = {};
        items.forEach(p => {
            const key = `${p.product_version_id}_${p.flavour_id || 'none'}`;
            if (mergedItems[key]) {
                mergedItems[key].quantity += p.quantity;
            } else {
                mergedItems[key] = {
                    product_version_id: p.product_version_id,
                    flavour_id: p.flavour_id,
                    quantity: p.quantity,
                    price_charged: p.price_charged,
                    standard_price_snap: p.standard_price_snap,
                    vendor_price_snap: p.vendor_price_snap
                };
            }
        });
        
        const uniqueItems = Object.values(mergedItems);
        
        await salesService.addSaleTransaction(sale_date, customer_id, uniqueItems, ownerId, recordedBy);
        res.json({ success: true, data: null });
    } catch (error) {
        console.error("Add Sale Error:", error);
        if (error.message.includes("Insufficient stock")) {
            return res.status(400).json({ success: false, message: "Insufficient stock to complete sale" });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.deleteSale = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        
        if (req.user.role !== 'admin') {
            const saleRes = await db.query(`SELECT recorded_by FROM sales WHERE id = $1 AND owner_id = $2 AND is_deleted = false`, [req.params.id, ownerId]);
            if (saleRes.rows.length === 0) return res.status(404).json({ success: false, message: "Sale not found" });
            if (saleRes.rows[0].recorded_by !== req.user.id) {
                return res.status(403).json({ success: false, message: "You don't have permission to delete this sale." });
            }
        }

        await salesService.deleteSaleTransaction(req.params.id, ownerId, req.user.id);
        res.json({ success: true, message: "Sale deleted successfully", data: null });
    } catch (error) {
        if (error.message === "Sale not found or already deleted") {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteSaleItem = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        await salesService.deleteSaleItemTransaction(req.params.id, ownerId, req.user.id, req.user.role);
        res.json({ success: true, message: "Sale item deleted successfully", data: null });
    } catch (error) {
        if (error.message.includes("not found") || error.message.includes("permission")) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Delete Sale Item Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
