const db = require('../config/db');

exports.getProducts = (req, res) => {
    try {
        db.all('SELECT * FROM products WHERE is_active = 1 AND owner_id = ?', [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: rows });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createProduct = (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') return res.status(400).json({ success: false, message: "Product name is required" });
        
        const normName = name.trim();
        const normNameLower = normName.toLowerCase();
        
        db.get('SELECT id FROM products WHERE LOWER(TRIM(name)) = ? AND owner_id = ?', [normNameLower, req.user.id], (err, row) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            
            if (row) {
                return res.status(400).json({ success: false, message: `Product "${normName}" already exists.` });
            }
            
            db.run('INSERT INTO products (name, owner_id) VALUES (?, ?)', [normName, req.user.id], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ success: false, message: `Product "${normName}" already exists.` });
                    }
                    return res.status(400).json({ success: false, message: err.message });
                }
                res.json({ success: true, data: { id: this.lastID, name: normName } });
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = (req, res) => {
    try {
        db.get('SELECT COUNT(*) as count FROM sale_items si JOIN product_variants pv ON si.variant_id = pv.id WHERE pv.product_id = ? AND pv.owner_id = ?', [req.params.id, req.user.id], (err, row) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (row && row.count > 0) {
                db.run('UPDATE products SET is_active = 0 WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id], function(err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, data: null, message: "Product soft deleted as it is used in sales." });
                });
            } else {
                db.run('DELETE FROM products WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id], function(err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, data: null, message: "Product permanently deleted." });
                });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
