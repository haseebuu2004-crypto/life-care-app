const db = require('../db');
const audit = require('../services/auditLogService');

exports.getProducts = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        
        // Fetch all products (including disabled) and their CURRENT active version
        const result = await db.query(`
            SELECT 
                p.id as product_id, 
                p.name as product_name,
                pv.id as version_id,
                pv.vendor_price,
                pv.volume_points,
                pv.is_active as version_is_active
            FROM products p
            JOIN product_versions pv ON pv.product_id = p.id
            WHERE p.owner_id = $1 AND (pv.is_active = true OR (pv.is_active = false AND NOT EXISTS (SELECT 1 FROM product_versions pv2 WHERE pv2.product_id = p.id AND pv2.is_active = true)))
            ORDER BY p.name ASC
        `, [ownerId]);
        
        // Let's ensure we only get the latest version if multiple exist (active or the latest inactive)
        const productsMap = new Map();
        result.rows.forEach(r => {
            if (!productsMap.has(r.product_id) || r.version_is_active) {
                productsMap.set(r.product_id, r);
            }
        });

        // Also fetch ALL flavours for these products
        const flavoursRes = await db.query(`
            SELECT id, product_id, name, is_active FROM flavours WHERE owner_id = $1
        `, [ownerId]);

        // Group flavours by product
        const flavourMap = {};
        flavoursRes.rows.forEach(f => {
            if (!flavourMap[f.product_id]) flavourMap[f.product_id] = [];
            flavourMap[f.product_id].push({ id: f.id, name: f.name, is_active: f.is_active });
        });
        
        const data = Array.from(productsMap.values()).map(row => ({
            id: row.product_id, // Map for frontend compatibility
            version_id: row.version_id,
            name: row.product_name,
            vendor_price: row.vendor_price / 100, // Convert PAISE to Rupees for frontend
            vp: row.volume_points, // VP
            is_active: row.version_is_active,
            flavours: flavourMap[row.product_id] || []
        }));
        
        res.json({ success: true, data });
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        let { name, vendor_price, vp, flavor, volume_points } = req.body;
        
        if (!name || name.trim() === '') return res.status(400).json({ success: false, message: "Product name required" });

        // Convert to PAISE - Handle both new and old frontend formats
        const finalVp = vendor_price !== undefined ? vendor_price : vp;
        
        if (finalVp === undefined) {
             return res.status(400).json({ success: false, message: "Vendor price is required" });
        }

        const vendorPricePaise = Math.round(Number(finalVp) * 100);

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Create product
            const prodRes = await client.query(
                `INSERT INTO products (owner_id, name) VALUES ($1, $2) RETURNING id`,
                [ownerId, name.trim()]
            );
            const productId = prodRes.rows[0].id;

            // If flavor provided, add it
            if (flavor && flavor.trim() !== '') {
                await client.query(`INSERT INTO flavours (product_id, owner_id, name) VALUES ($1, $2, $3)`, [productId, ownerId, flavor.trim()]);
            }

            // Create initial version
            const vpValue = volume_points ? parseFloat(volume_points) : 0;
            const pvRes = await client.query(
                `INSERT INTO product_versions (product_id, vendor_price, volume_points, created_by) VALUES ($1, $2, $3, $4) RETURNING id`,
                [productId, vendorPricePaise, vpValue, req.user.id]
            );
            const versionId = pvRes.rows[0].id;

            // (Removed auto-create stock row. Stock is only created when explicitly added via Add Stock)

            await client.query('COMMIT');
            client.release();
            
            await audit.logAction(req.user.id, 'PRODUCT_CREATE', 'products', productId);

            res.json({ success: true, message: "Product created", product_id: productId });
        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            console.error("Add Product Error:", error);
            if (error.code === '23505') {
                return res.status(400).json({ success: false, message: "A product with this name already exists." });
            }
            res.status(500).json({ success: false, message: "Server error" });
        }
    } catch (error) {
        console.error("Add Product Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateProductPrice = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { id } = req.params; // Product ID
        const { vendor_price } = req.body;

        const vendorPricePaise = Math.round(Number(vendor_price) * 100);

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Get current active version
            const currVersionRes = await client.query(`SELECT id FROM product_versions WHERE product_id = $1 AND is_active = true`, [id]);
            const oldVersionId = currVersionRes.rows.length > 0 ? currVersionRes.rows[0].id : null;

            if (oldVersionId) {
                // Deprecate old version
                await client.query(`UPDATE product_versions SET is_active = false, effective_to = NOW() WHERE id = $1`, [oldVersionId]);
            }

            // 2. Insert new version
            const newVersionRes = await client.query(
                `INSERT INTO product_versions (product_id, vendor_price, created_by, is_active, effective_from) 
                 VALUES ($1, $2, $3, true, NOW()) RETURNING id`,
                [id, vendorPricePaise, req.user.id]
            );
            const newVersionId = newVersionRes.rows[0].id;

            // 3. Migrate stock pointing to old version to new version (only if it exists)
            if (oldVersionId) {
                await client.query(`
                    UPDATE stock SET product_version_id = $1, vendor_price_snap = $2 
                    WHERE product_version_id = $3 AND owner_id = $4`,
                    [newVersionId, vendorPricePaise, oldVersionId, ownerId]
                );
            }

            await client.query('COMMIT');
            client.release();
            
            await audit.logAction(req.user.id, 'PRODUCT_PRICE_UPDATE', 'products', id);
            
            res.json({ success: true, message: "Product price updated and stock migrated." });
        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            console.error("Update Price Error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    } catch (error) {
        console.error("Update Price Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params; // product_version_id or product_id?
        // Wait, the UI passes product_id. We toggle the active version's status.
        // Actually, we just set the product_version's is_active = !is_active.
        
        const currRes = await db.query(`SELECT id, is_active FROM product_versions WHERE product_id = $1 ORDER BY effective_from DESC LIMIT 1`, [id]);
        if (currRes.rows.length === 0) return res.status(404).json({ success: false, message: "No version found" });
        
        const versionId = currRes.rows[0].id;
        const newStatus = !currRes.rows[0].is_active;
        
        await db.query(`UPDATE product_versions SET is_active = $1 WHERE id = $2`, [newStatus, versionId]);
        
        res.json({ success: true, message: `Product ${newStatus ? 'enabled' : 'disabled'}` });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Flavour endpoints
exports.addFlavour = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { product_id, name } = req.body;
        await db.query(`INSERT INTO flavours (product_id, owner_id, name) VALUES ($1, $2, $3)`, [product_id, ownerId, name]);
        res.json({ success: true, message: "Flavour added" });
    } catch (e) {
        if (e.code === '23505') {
            return res.status(400).json({ success: false, message: "This flavour already exists for this product." });
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.toggleFlavour = async (req, res) => {
    try {
        const { id } = req.params;
        const curr = await db.query(`SELECT is_active FROM flavours WHERE id = $1`, [id]);
        if (curr.rows.length === 0) return res.status(404).json({ success: false, message: "Not found" });
        await db.query(`UPDATE flavours SET is_active = $1 WHERE id = $2`, [!curr.rows[0].is_active, id]);
        res.json({ success: true, message: "Flavour toggled" });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteFlavour = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if any sale_items reference it
        const check = await db.query(`SELECT 1 FROM sale_items WHERE flavour_id = $1 LIMIT 1`, [id]);
        if (check.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Cannot delete flavour because it has existing sales. Disable it instead." });
        }
        await db.query(`DELETE FROM flavours WHERE id = $1`, [id]);
        res.json({ success: true, message: "Flavour deleted" });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
