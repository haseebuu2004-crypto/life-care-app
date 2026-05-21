const db = require('../config/db');

exports.getAllSales = (ownerId) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT s.id as id, si.id as item_id, s.date, s.customer, pv.flavor, p.name as product_name, si.qty, si.sale_price, si.total_amount, si.profit, si.variant_id as stock_id
                FROM sale_items si
                JOIN sales s ON si.sale_id = s.id
                LEFT JOIN product_variants pv ON si.variant_id = pv.id
                LEFT JOIN products p ON pv.product_id = p.id
                WHERE s.owner_id = ?
                ORDER BY s.date DESC`, [ownerId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

exports.addSaleTransaction = (date, customerName, uniqueProducts, ownerId) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            db.run('INSERT INTO sales (date, customer, total_amount, total_profit, owner_id) VALUES (?, ?, 0, 0, ?)', [date, customerName, ownerId], function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return reject(err);
                }
                const saleId = this.lastID;
                let saleTotalAmount = 0;
                let saleTotalProfit = 0;

                const processItem = (index) => {
                    if (index >= uniqueProducts.length) {
                        // All processed
                        db.run('UPDATE sales SET total_amount = ?, total_profit = ? WHERE id = ? AND owner_id = ?', [saleTotalAmount, saleTotalProfit, saleId, ownerId], (updateErr) => {
                            if (updateErr) {
                                db.run('ROLLBACK');
                                return reject(updateErr);
                            }
                            db.run('COMMIT');
                            resolve();
                        });
                        return;
                    }

                    const p = uniqueProducts[index];
                    
                    // Fetch stock info with product name for better errors
                    db.get(`
                        SELECT s.qty, pr.name as product_name, pv.flavor 
                        FROM stock s 
                        JOIN product_variants pv ON s.variant_id = pv.id
                        JOIN products pr ON pv.product_id = pr.id
                        WHERE s.variant_id = ? AND s.owner_id = ?
                    `, [p.stock_id, ownerId], (err, row) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return reject(err);
                        }
                        
                        if (!row) {
                            db.run('ROLLBACK');
                            return reject(new Error("Invalid product variant selected."));
                        }
                        
                        if (row.qty < p.quantity) {
                            db.run('ROLLBACK');
                            const flavorText = row.flavor && row.flavor !== 'Base' ? ` (${row.flavor})` : '';
                            return reject(new Error(`Only ${row.qty} units available for ${row.product_name}${flavorText}`));
                        }

                        db.run('UPDATE stock SET qty = qty - ? WHERE variant_id = ? AND owner_id = ?', [p.quantity, p.stock_id, ownerId], (updateErr) => {
                            if (updateErr) {
                                db.run('ROLLBACK');
                                return reject(updateErr);
                            }
                            
                            db.run('INSERT INTO sale_items (sale_id, variant_id, qty, sale_price, total_amount, profit, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                                [saleId, p.stock_id, p.quantity, p.sale_price, p.total_amount, p.profit, ownerId], (insErr) => {
                                    if (insErr) {
                                        db.run('ROLLBACK');
                                        return reject(insErr);
                                    }
                                    saleTotalAmount += p.total_amount;
                                    saleTotalProfit += p.profit;
                                    
                                    processItem(index + 1);
                            });
                        });
                    });
                };

                processItem(0);
            });
        });
    });
};

exports.deleteSaleTransaction = (id, ownerId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM sales WHERE id = ? AND owner_id = ?', [id, ownerId], (err, sale) => {
            if (err) return reject(err);
            if (!sale) return reject(new Error("Sale not found"));

            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.run('DELETE FROM sale_items WHERE sale_id = ? AND owner_id = ?', [id, ownerId], (err) => {
                    if (err) { db.run('ROLLBACK'); return reject(err); }
                    db.run('DELETE FROM sales WHERE id = ? AND owner_id = ?', [id, ownerId], (err) => {
                        if (err) { db.run('ROLLBACK'); return reject(err); }
                        db.run('COMMIT');
                        resolve();
                    });
                });
            });
        });
    });
};
