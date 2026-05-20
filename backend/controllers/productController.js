const db = require('../config/db');

exports.getProducts = (req, res) => {
    try {
        db.all('SELECT * FROM products WHERE is_active = 1', [], (err, rows) => {
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
        if (!name) return res.status(400).json({ success: false, message: "Product name is required" });
        db.run('INSERT INTO products (name) VALUES (?)', [name], function(err) {
            if (err) return res.status(400).json({ success: false, message: err.message });
            res.json({ success: true, data: { id: this.lastID, name } });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = (req, res) => {
    try {
        db.get('SELECT COUNT(*) as count FROM sale_items si JOIN product_variants pv ON si.variant_id = pv.id WHERE pv.product_id = ?', [req.params.id], (err, row) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (row && row.count > 0) {
                db.run('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id], function(err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, data: null, message: "Product soft deleted as it is used in sales." });
                });
            } else {
                db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, data: null, message: "Product permanently deleted." });
                });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
