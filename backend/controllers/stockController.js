const pool = require('../config/db');
const { getOwnerId } = require('../middleware/authMiddleware');

exports.getStock = async (req, res) => {
    try {
        const ownerId = getOwnerId(req);
        const { rows } = await pool.query(`
            SELECT pv.id as id, pv.flavor, pv.vp, pv.sp, COALESCE(s.qty, 0) as qty, p.name as product_name 
            FROM product_variants pv 
            JOIN products p ON pv.product_id = p.id 
            LEFT JOIN stock s ON s.variant_id = pv.id 
            WHERE pv.is_active = 1 AND p.is_active = 1 AND p.owner_id = $1
        `, [ownerId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addStock = async (req, res) => {
    console.log('Stock Request Body:', req.body);
    try {
        const productName = req.body.productName || req.body.name; 
        const hasFlavours = req.body.hasFlavours;
        const flavour = req.body.flavour || '';
        const price = Number(req.body.price) || 0;
        const volumePoint = Number(req.body.volumePoint) || 0;
        const quantity = Number(req.body.quantity) || 0;

        if (!productName || productName.trim() === '') {
            return res.status(400).json({ success: false, message: "Product name is required" });
        }

        const normName = productName.trim();
        const normNameLower = normName.toLowerCase();
        const finalFlavor = (hasFlavours && flavour.trim() !== '') ? flavour.trim() : 'Base';
        const finalFlavorLower = finalFlavor.toLowerCase();
        const ownerId = getOwnerId(req);

        const { rows: products } = await pool.query('SELECT id, name FROM products WHERE LOWER(TRIM(name)) = $1 AND owner_id = $2', [normNameLower, ownerId]);
        let productId;
        
        if (products.length > 0) {
            productId = products[0].id;
        } else {
            try {
                const insertProductRes = await pool.query('INSERT INTO products (name, owner_id) VALUES ($1, $2) RETURNING id', [normName, ownerId]);
                productId = insertProductRes.rows[0].id;
            } catch (err) {
                console.error('SQL Error (INSERT product):', err);
                if (err.message.includes('unique constraint') || err.message.includes('UNIQUE constraint')) {
                    return res.status(400).json({ success: false, message: `Product "${normName}" already exists.` });
                }
                return res.status(500).json({ success: false, message: 'Database error creating product: ' + err.message });
            }
        }

        const { rows: variants } = await pool.query('SELECT id FROM product_variants WHERE product_id = $1 AND LOWER(TRIM(flavor)) = $2 AND owner_id = $3', [productId, finalFlavorLower, ownerId]);
        
        if (variants.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: hasFlavours 
                    ? `Product "${normName}" with flavour "${finalFlavor}" already exists.` 
                    : `Product "${normName}" already exists.` 
            });
        } else {
            try {
                const insertVariantRes = await pool.query(
                    'INSERT INTO product_variants (product_id, flavor, vp, sp, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    [productId, finalFlavor, volumePoint, price, ownerId]
                );
                const pvId = insertVariantRes.rows[0].id;
                
                await pool.query('INSERT INTO stock (variant_id, qty, owner_id) VALUES ($1, $2, $3)', [pvId, quantity, ownerId]);
                
                res.status(200).json({ success: true, data: { id: pvId, message: "Stock added" } });
            } catch (err) {
                console.error('SQL Error (INSERT variant/stock):', err.stack || err);
                return res.status(500).json({ success: false, message: 'Database error creating variant/stock: ' + err.message });
            }
        }
    } catch (error) {
        console.error('Stock Add Error Stack:', error.stack || error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.increaseStock = async (req, res) => {
    try {
        const { qty_add } = req.body;
        const ownerId = getOwnerId(req);
        if (!qty_add || qty_add <= 0) return res.status(400).json({ success: false, message: "Valid quantity required" });

        await pool.query('UPDATE stock SET qty = qty + $1 WHERE variant_id = $2 AND owner_id = $3', [qty_add, req.params.id, ownerId]);
        res.json({ success: true, data: { message: "Stock increased" } });
    } catch (error) {
        console.error("Stock Increase Error:", error.stack || error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateStockQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;
        const ownerId = getOwnerId(req);
        if (quantity === undefined || quantity < 0) return res.status(400).json({ success: false, message: "Valid quantity required" });

        await pool.query('UPDATE stock SET qty = $1 WHERE variant_id = $2 AND owner_id = $3', [quantity, req.params.id, ownerId]);
        res.json({ success: true, data: { message: "Stock quantity updated" } });
    } catch (error) {
        console.error("Stock Update Error:", error.stack || error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteStock = async (req, res) => {
    try {
        const ownerId = getOwnerId(req);
        // Soft delete variant so sales history is kept
        const { rows } = await pool.query(
            'SELECT COUNT(*) as count FROM sale_items WHERE variant_id = $1 AND owner_id = $2', 
            [req.params.id, ownerId]
        );
        const count = parseInt(rows[0]?.count || 0);

        if (count > 0) {
            await pool.query('UPDATE product_variants SET is_active = 0 WHERE id = $1 AND owner_id = $2', [req.params.id, ownerId]);
            await pool.query('DELETE FROM stock WHERE variant_id = $1 AND owner_id = $2', [req.params.id, ownerId]);
            res.json({ success: true, data: null, message: "Stock hidden from inventory but kept in sales history." });
        } else {
            await pool.query('DELETE FROM product_variants WHERE id = $1 AND owner_id = $2', [req.params.id, ownerId]);
            res.json({ success: true, data: null, message: "Stock deleted permanently." });
        }
    } catch (error) {
        console.error("Stock Delete Error:", error.stack || error);
        res.status(500).json({ success: false, message: error.message });
    }
};
