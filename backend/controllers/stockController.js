const db = require('../config/db');

exports.getStock = (req, res) => {
    try {
        db.all(`SELECT pv.id as id, pv.flavor, pv.vp, pv.sp, IFNULL(s.qty, 0) as qty, p.name as product_name 
                FROM product_variants pv 
                JOIN products p ON pv.product_id = p.id 
                LEFT JOIN stock s ON s.variant_id = pv.id 
                WHERE pv.is_active = 1 AND p.is_active = 1 AND p.owner_id = ?`, [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: rows });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addStock = (req, res) => {
    console.log('Stock Request Body:', req.body);
    try {
        const productName = req.body.productName || req.body.name; // supporting both for safety
        const hasFlavours = req.body.hasFlavours;
        const flavour = req.body.flavour || '';
        const price = Number(req.body.price) || 0;
        const volumePoint = Number(req.body.volumePoint) || 0;
        const quantity = Number(req.body.quantity) || 0;

        if (!productName) return res.status(400).json({ success: false, message: "Product name is required" });

        const normName = productName.trim().toLowerCase();
        const finalFlavor = (hasFlavours && flavour.trim() !== '') ? flavour.trim() : 'Base';
        const ownerId = req.user.id;
        
        db.serialize(() => {
            db.get('SELECT id FROM products WHERE LOWER(TRIM(name)) = ? AND owner_id = ?', [normName, ownerId], (err, product) => {
                if (err) {
                    console.error('SQL Error (SELECT products):', err);
                    return res.status(500).json({ success: false, message: 'Database error finding product: ' + err.message });
                }
                
                const handleStock = (productId) => {
                    db.get('SELECT id FROM product_variants WHERE product_id = ? AND LOWER(TRIM(flavor)) = ? AND owner_id = ?', [productId, finalFlavor.toLowerCase(), ownerId], (err, pv) => {
                        if (err) {
                            console.error('SQL Error (SELECT variant):', err);
                            return res.status(500).json({ success: false, message: 'Database error finding variant: ' + err.message });
                        }
                        if (pv) {
                            db.run('UPDATE stock SET qty = qty + ? WHERE variant_id = ? AND owner_id = ?', [quantity, pv.id, ownerId], function(err) {
                                if (err) {
                                    console.error('SQL Error (UPDATE stock):', err);
                                    return res.status(500).json({ success: false, message: 'Database error updating stock: ' + err.message });
                                }
                                if (this.changes === 0) {
                                    // Stock record doesn't exist yet for this variant, create it
                                    db.run('INSERT INTO stock (variant_id, qty, owner_id) VALUES (?, ?, ?)', [pv.id, quantity, ownerId], function(insertErr) {
                                        if (insertErr) {
                                            console.error('SQL Error (INSERT missing stock):', insertErr);
                                            return res.status(500).json({ success: false, message: 'Database error creating stock: ' + insertErr.message });
                                        }
                                        res.status(200).json({ success: true, data: { id: pv.id, message: "Stock created" } });
                                    });
                                } else {
                                    res.status(200).json({ success: true, data: { id: pv.id, message: "Stock updated" } });
                                }
                            });
                        } else {
                            db.run('INSERT INTO product_variants (product_id, flavor, vp, sp, owner_id) VALUES (?, ?, ?, ?, ?)',
                                [productId, finalFlavor, volumePoint, price, ownerId], function(err) {
                                if (err) {
                                    console.error('SQL Error (INSERT variant):', err);
                                    return res.status(500).json({ success: false, message: 'Database error creating variant: ' + err.message });
                                }
                                const pvId = this.lastID;
                                db.run('INSERT INTO stock (variant_id, qty, owner_id) VALUES (?, ?, ?)', [pvId, quantity, ownerId], function(err) {
                                    if (err) {
                                        console.error('SQL Error (INSERT stock):', err);
                                        return res.status(500).json({ success: false, message: 'Database error creating stock: ' + err.message });
                                    }
                                    res.status(200).json({ success: true, data: { id: pvId, message: "Stock added" } });
                                });
                            });
                        }
                    });
                };

                if (product) {
                    handleStock(product.id);
                } else {
                    db.run('INSERT INTO products (name, owner_id) VALUES (?, ?)', [productName.trim(), ownerId], function(err) {
                        if (err) {
                            console.error('SQL Error (INSERT product):', err);
                            return res.status(500).json({ success: false, message: 'Database error creating product: ' + err.message });
                        }
                        handleStock(this.lastID);
                    });
                }
            });
        });
    } catch (error) {
        console.error('Stock Controller Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.increaseStock = (req, res) => {
    try {
        const { qty_add } = req.body;
        if (!qty_add || qty_add < 0) return res.status(400).json({ success: false, message: "Cannot deduct stock directly" });
        db.run('UPDATE stock SET qty = qty + ? WHERE variant_id = ? AND owner_id = ?', [qty_add, req.params.id, req.user.id], function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: null });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateStockQuantity = (req, res) => {
    try {
        const { quantity } = req.body;
        const qty = Number(quantity);
        
        if (isNaN(qty) || qty < 0) {
            return res.status(400).json({ success: false, message: "Invalid quantity. Must be 0 or greater." });
        }
        
        db.run('UPDATE stock SET qty = ? WHERE variant_id = ? AND owner_id = ?', [qty, req.params.id, req.user.id], function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: null, message: "Stock updated successfully." });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteStock = (req, res) => {
    try {
        db.get('SELECT COUNT(*) as count FROM sale_items WHERE variant_id = ? AND owner_id = ?', [req.params.id, req.user.id], (err, row) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (row && row.count > 0) {
                db.run('UPDATE product_variants SET is_active = 0 WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id], function(err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, data: null, message: "Flavour soft deleted as it is used in sales." });
                });
            } else {
                db.run('DELETE FROM product_variants WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id], function(err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, data: null, message: "Flavour permanently deleted." });
                });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
