const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticateToken, authorizeRole, SECRET } = require('../middleware/auth');

// Auth
router.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user) return res.status(401).json({ error: "Invalid credentials" });
        
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) return res.status(401).json({ error: "Invalid credentials" });
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '8h' });
            res.json({ token, role: user.role, username: user.username });
        });
    });
});

// Products: Admin has full CRUD. User cannot mutate.
router.get('/products', authenticateToken, (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
router.post('/products', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO products (name) VALUES (?)', [name], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: this.lastID, name });
    });
});
router.delete('/products/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
        res.json({ success: true });
    });
});

// Stock Variations
router.get('/stock', authenticateToken, (req, res) => {
    db.all(`SELECT s.*, p.name as product_name FROM stock s JOIN products p ON s.product_id = p.id`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
router.post('/stock', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { product_id, flavor, vp, sp, qty } = req.body;
    db.run('INSERT INTO stock (product_id, flavor, vp, sp, qty) VALUES (?, ?, ?, ?, ?)', 
        [product_id, flavor || 'Base', vp || 0, sp || 0, qty || 0], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: this.lastID });
    });
});
// users can only ADD to stock. Admin can edit explicitly.
router.put('/stock/:id/add', authenticateToken, (req, res) => {
    const { qty_add } = req.body;
    if (qty_add < 0) return res.status(400).json({ error: "Cannot deduct stock directly" });
    db.run('UPDATE stock SET qty = qty + ? WHERE id = ?', [qty_add, req.params.id], function(err) {
        res.json({ success: true });
    });
});
router.delete('/stock/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
    db.run('DELETE FROM stock WHERE id = ?', [req.params.id], function(err) {
        res.json({ success: true });
    });
});

// Sales: user can add sale
router.get('/sales', authenticateToken, (req, res) => {
    db.all(`SELECT s.*, st.flavor, p.name as product_name FROM sales s 
            LEFT JOIN stock st ON s.stock_id = st.id
            LEFT JOIN products p ON st.product_id = p.id`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
router.post('/sales', authenticateToken, (req, res) => {
    const { date, customer, stock_id, qty, sale_price } = req.body;
    db.serialize(() => {
        db.get('SELECT qty, sp FROM stock WHERE id = ?', [stock_id], (err, row) => {
            if (err || !row) return res.status(400).json({ error: "Invalid stock" });
            if (row.qty < qty) return res.status(400).json({ error: "Not enough stock" });

            const total = qty * sale_price;
            const profit = total - (qty * row.sp);

            db.run('UPDATE stock SET qty = qty - ? WHERE id = ?', [qty, stock_id], (updateErr) => {
                if (updateErr) return res.status(500).json({ error: updateErr.message });
                db.run('INSERT INTO sales (date, customer, stock_id, qty, sale_price, total_amount, profit) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [date, customer, stock_id, qty, sale_price, total, profit], function(insErr) {
                        res.json({ id: this.lastID, success: true });
                });
            });
        });
    });
});
router.delete('/sales/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
    db.run('DELETE FROM sales WHERE id = ?', [req.params.id], function(err) {
        res.json({ success: true });
    });
});

// Attendance & Usage Logic
router.get('/attendance', authenticateToken, (req, res) => {
    db.all('SELECT * FROM attendance', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
router.post('/attendance', authenticateToken, (req, res) => {
    const { date, name, status } = req.body;
    const normName = name.trim().toLowerCase();

    db.run('INSERT INTO attendance (date, name, status) VALUES (?, ?, ?)', [date, normName, status], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        
        if (status === 'Present') {
            // usage deduction
            db.get('SELECT * FROM personal_usage WHERE name = ?', [normName], (err, row) => {
                if (!row) {
                    db.run('INSERT INTO personal_usage (name, f1, pp, afresh, others) VALUES (?, ?, ?, ?, ?)', [normName, -3, -1, -2, -30]);
                } else {
                    db.run('UPDATE personal_usage SET f1 = f1 - 3, pp = pp - 1, afresh = afresh - 2, others = others - 30, updated_at = CURRENT_TIMESTAMP WHERE name = ?', [normName]);
                }
            });
        }
        res.json({ success: true });
    });
});
router.delete('/attendance/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
    db.run('DELETE FROM attendance WHERE id = ?', [req.params.id], function() { res.json({ success: true }); });
});

// Usage
router.get('/usage', authenticateToken, (req, res) => {
    db.all('SELECT * FROM personal_usage', [], (err, rows) => {
        res.json(rows);
    });
});
router.put('/usage/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { f1, pp, afresh, others, sp } = req.body;
    db.run('UPDATE personal_usage SET f1 = ?, pp = ?, afresh = ?, others = ?, sp = ? WHERE id = ?', [f1, pp, afresh, others, sp, req.params.id], function() {
        res.json({ success: true });
    });
});
router.post('/usage', authenticateToken, (req, res) => {
    const { name } = req.body;
    const normName = name.trim().toLowerCase();
    db.get('SELECT * FROM personal_usage WHERE name = ?', [normName], (err, row) => {
        if (row) return res.status(400).json({ error: "Customer exists" });
        db.run('INSERT INTO personal_usage (name) VALUES (?)', [normName], function() { res.json({ success: true }); });
    });
});

module.exports = router;
