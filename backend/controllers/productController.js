const pool = require('../config/db');
const { getOwnerId } = require('../middleware/authMiddleware');

exports.getProducts = async (req, res) => {
    try {
        const ownerId = getOwnerId(req);
        const { rows } = await pool.query('SELECT * FROM products WHERE is_active = 1 AND owner_id = $1', [ownerId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') return res.status(400).json({ success: false, message: "Product name is required" });
        
        const normName = name.trim();
        const normNameLower = normName.toLowerCase();
        const ownerId = getOwnerId(req);
        
        const { rows } = await pool.query('SELECT id FROM products WHERE LOWER(TRIM(name)) = $1 AND owner_id = $2', [normNameLower, ownerId]);
        
        if (rows.length > 0) {
            return res.status(400).json({ success: false, message: `Product "${normName}" already exists.` });
        }
        
        try {
            const insertRes = await pool.query(
                'INSERT INTO products (name, owner_id) VALUES ($1, $2) RETURNING id', 
                [normName, ownerId]
            );
            res.json({ success: true, data: { id: insertRes.rows[0].id, name: normName } });
        } catch (err) {
            if (err.message.includes('unique constraint') || err.message.includes('UNIQUE constraint')) {
                return res.status(400).json({ success: false, message: `Product "${normName}" already exists.` });
            }
            return res.status(400).json({ success: false, message: err.message });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const ownerId = getOwnerId(req);
        const { rows } = await pool.query(
            'SELECT COUNT(*) as count FROM sale_items si JOIN product_variants pv ON si.variant_id = pv.id WHERE pv.product_id = $1 AND pv.owner_id = $2', 
            [req.params.id, ownerId]
        );
        
        const count = parseInt(rows[0]?.count || 0);
        
        if (count > 0) {
            await pool.query('UPDATE products SET is_active = 0 WHERE id = $1 AND owner_id = $2', [req.params.id, ownerId]);
            res.json({ success: true, data: null, message: "Product soft deleted as it is used in sales." });
        } else {
            await pool.query('DELETE FROM products WHERE id = $1 AND owner_id = $2', [req.params.id, ownerId]);
            res.json({ success: true, data: null, message: "Product permanently deleted." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
