const db = require('../db');
const audit = require('../services/auditLogService');

exports.getStock = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        
        // Fetch active product versions and their current stock
        const result = await db.query(`
            SELECT 
                s.id as stock_id,
                pv.id as version_id,
                p.id as product_id,
                p.name as product_name,
                f.id as flavour_id,
                f.name as flavor,
                pv.vendor_price,
                pv.volume_points,
                COALESCE(s.quantity, 0) as qty
            FROM product_versions pv
            JOIN products p ON pv.product_id = p.id
            LEFT JOIN flavours f ON f.product_id = p.id AND f.is_active = true
            INNER JOIN stock s ON s.product_version_id = pv.id AND s.owner_id = $1
            WHERE p.owner_id = $1 AND pv.is_active = true
            ORDER BY p.name ASC
        `, [ownerId]);
        
        const data = result.rows.map(row => ({
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
        
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get Stock Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.addStock = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        // variantId is product_version_id
        const { variantId, quantity } = req.body; 
        
        if (!variantId || !quantity || quantity <= 0) {
            return res.status(400).json({ success: false, message: "Valid version ID and quantity > 0 required" });
        }

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Check if version belongs to owner and is active
            const pvRes = await client.query(`
                SELECT pv.id, pv.vendor_price 
                FROM product_versions pv
                JOIN products p ON pv.product_id = p.id
                WHERE pv.id = $1 AND p.owner_id = $2 AND pv.is_active = true
            `, [variantId, ownerId]);

            if (pvRes.rows.length === 0) {
                await client.query('ROLLBACK');
                client.release();
                return res.status(404).json({ success: false, message: "Product version not found or inactive" });
            }

            const vendorPriceSnap = pvRes.rows[0].vendor_price;

            // Try to update existing stock row
            const updateRes = await client.query(`
                UPDATE stock SET quantity = quantity + $1, vendor_price_snap = $2 
                WHERE product_version_id = $3 AND owner_id = $4 RETURNING id
            `, [quantity, vendorPriceSnap, variantId, ownerId]);

            if (updateRes.rows.length === 0) {
                // No existing row, insert new
                await client.query(`
                    INSERT INTO stock (product_version_id, owner_id, quantity, vendor_price_snap, added_by)
                    VALUES ($1, $2, $3, $4, $5)
                `, [variantId, ownerId, quantity, vendorPriceSnap, req.user.id]);
            }

            await client.query('COMMIT');
            client.release();
            
            await audit.logAction(req.user.id, 'STOCK_ADD', 'stock', null, null, { product_version_id: variantId, quantity_added: quantity });

            res.json({ success: true, message: "Stock added successfully" });
        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            console.error("Add Stock Error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    } catch (error) {
        console.error("Add Stock Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateStockQuantity = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { id } = req.params; // stock_id
        const { quantity } = req.body;
        
        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({ success: false, message: "Valid quantity >= 0 required" });
        }

        const result = await db.query(`UPDATE stock SET quantity = $1 WHERE id = $2 AND owner_id = $3 RETURNING id`, [quantity, id, ownerId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Stock not found" });
        }
        
        await audit.logAction(req.user.id, 'STOCK_UPDATE', 'stock', id, null, { new_quantity: quantity });
        
        res.json({ success: true, message: "Stock updated successfully." });
    } catch (error) {
        console.error("Update Stock Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateStockPrice = async (req, res) => {
    res.status(400).json({ success: false, message: "Use product settings to update prices." });
};

exports.increaseStock = async (req, res) => {
    res.status(400).json({ success: false, message: "Use the add stock endpoint." });
};

exports.decreaseStock = async (req, res) => {
    res.status(400).json({ success: false, message: "Direct decrease disabled. Use sales or product manager." });
};

exports.deleteStock = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { id } = req.params; // This is the stock_id

        // Actually delete the stock row so it stops appearing in Stock Overview
        await db.query(`DELETE FROM stock WHERE id = $1 AND owner_id = $2`, [id, ownerId]);
        
        await audit.logAction(req.user.id, 'STOCK_DELETE', 'stock', id);
        
        res.json({ success: true, message: "Stock deleted." });
    } catch (error) {
        console.error("Delete Stock Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
