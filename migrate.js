const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, './backend/data/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error(err);
    console.log("Connected");
});

db.serialize(() => {
    console.log("Starting migration...");
    
    // Create new tables
    db.run(`CREATE TABLE IF NOT EXISTS product_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        flavor TEXT,
        vp REAL DEFAULT 0,
        sp REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS new_stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        variant_id INTEGER UNIQUE,
        qty INTEGER DEFAULT 0,
        FOREIGN KEY(variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS new_sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        customer TEXT,
        total_amount REAL DEFAULT 0,
        profit REAL DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER,
        variant_id INTEGER,
        qty INTEGER,
        sale_price REAL,
        total_amount REAL,
        profit REAL,
        FOREIGN KEY(sale_id) REFERENCES new_sales(id) ON DELETE CASCADE,
        FOREIGN KEY(variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT
    )`);

    // Migrate Stock -> ProductVariants and New Stock
    db.all(`SELECT * FROM stock`, [], (err, rows) => {
        if (err) {
            console.error(err);
            // If stock doesn't exist, maybe already migrated
            return;
        }
        
        let completedStock = 0;
        if (rows.length === 0) return migrateSales();
        rows.forEach(row => {
            // Check if variant exists
            db.get(`SELECT id FROM product_variants WHERE id = ?`, [row.id], (err, pv) => {
                if (pv) {
                    completedStock++;
                    if (completedStock === rows.length) migrateSales();
                } else {
                    db.run(`INSERT INTO product_variants (id, product_id, flavor, vp, sp, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
                        [row.id, row.product_id, row.flavor, row.vp, row.sp, row.is_active], function(err) {
                            if (err) console.error("PV Error:", err);
                            db.run(`INSERT INTO new_stock (variant_id, qty) VALUES (?, ?)`, [row.id, row.qty], (err) => {
                                completedStock++;
                                if (completedStock === rows.length) migrateSales();
                            });
                    });
                }
            });
        });
    });

    function migrateSales() {
        db.all(`SELECT * FROM sales`, [], (err, rows) => {
            if (err) {
                console.error(err);
                return;
            }
            if (rows.length === 0) return finishMigration();
            let completedSales = 0;
            rows.forEach(row => {
                db.get(`SELECT id FROM new_sales WHERE date = ? AND customer = ?`, [row.date, row.customer], (err, existingSale) => {
                    if (existingSale) {
                        db.run(`UPDATE new_sales SET total_amount = total_amount + ?, profit = profit + ? WHERE id = ?`, 
                            [row.total_amount, row.profit, existingSale.id], () => {
                                db.run(`INSERT INTO sale_items (sale_id, variant_id, qty, sale_price, total_amount, profit) VALUES (?, ?, ?, ?, ?, ?)`,
                                    [existingSale.id, row.stock_id, row.qty, row.sale_price, row.total_amount, row.profit], () => {
                                        completedSales++;
                                        if (completedSales === rows.length) finishMigration();
                                });
                        });
                    } else {
                        db.run(`INSERT INTO new_sales (date, customer, total_amount, profit) VALUES (?, ?, ?, ?)`,
                            [row.date, row.customer, row.total_amount, row.profit], function(err) {
                                const saleId = this.lastID;
                                db.run(`INSERT INTO sale_items (sale_id, variant_id, qty, sale_price, total_amount, profit) VALUES (?, ?, ?, ?, ?, ?)`,
                                    [saleId, row.stock_id, row.qty, row.sale_price, row.total_amount, row.profit], () => {
                                        completedSales++;
                                        if (completedSales === rows.length) finishMigration();
                                });
                        });
                    }
                });
            });
        });
    }

    function finishMigration() {
        db.run("DROP TABLE stock", () => {
            db.run("DROP TABLE sales", () => {
                db.run("ALTER TABLE new_stock RENAME TO stock");
                db.run("ALTER TABLE new_sales RENAME TO sales");
                console.log("Migration complete.");
            });
        });
    }
});
