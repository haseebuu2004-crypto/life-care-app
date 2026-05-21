module.exports = {
    up: async function(db) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // Helper to add column safely
            const addColumn = (table, column, definition) => {
                return new Promise((res) => {
                    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (err) => {
                        // ignore error if column exists
                        res();
                    });
                });
            };

            const migrate = async () => {
                try {
                    await addColumn('products', 'owner_id', 'INTEGER');
                    await addColumn('product_variants', 'owner_id', 'INTEGER');
                    await addColumn('stock', 'owner_id', 'INTEGER');
                    await addColumn('sales', 'owner_id', 'INTEGER');
                    await addColumn('sale_items', 'owner_id', 'INTEGER');
                    await addColumn('attendance', 'owner_id', 'INTEGER');
                    await addColumn('settings', 'owner_id', 'INTEGER');

                    // Set default owner to ID 1 for existing records
                    db.run(`UPDATE products SET owner_id = 1 WHERE owner_id IS NULL`);
                    db.run(`UPDATE product_variants SET owner_id = 1 WHERE owner_id IS NULL`);
                    db.run(`UPDATE stock SET owner_id = 1 WHERE owner_id IS NULL`);
                    db.run(`UPDATE sales SET owner_id = 1 WHERE owner_id IS NULL`);
                    db.run(`UPDATE sale_items SET owner_id = 1 WHERE owner_id IS NULL`);
                    db.run(`UPDATE attendance SET owner_id = 1 WHERE owner_id IS NULL`);
                    db.run(`UPDATE settings SET owner_id = 1 WHERE owner_id IS NULL`);

                    // Recreate products table to remove UNIQUE on just `name` and add UNIQUE(name, owner_id)
                    db.run(`CREATE TABLE IF NOT EXISTS products_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        is_active INTEGER DEFAULT 1,
                        owner_id INTEGER,
                        UNIQUE(name, owner_id)
                    )`);

                    db.run(`INSERT INTO products_new (id, name, created_at, is_active, owner_id)
                            SELECT id, name, created_at, is_active, owner_id FROM products`, (err) => {
                        if (!err) {
                            db.run(`DROP TABLE products`);
                            db.run(`ALTER TABLE products_new RENAME TO products`);
                            db.run(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`);
                        }
                    });

                    // Recreate settings to remove UNIQUE on `key`
                    db.run(`CREATE TABLE IF NOT EXISTS settings_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        key TEXT,
                        value TEXT,
                        owner_id INTEGER,
                        UNIQUE(key, owner_id)
                    )`);

                    db.run(`INSERT INTO settings_new (id, key, value, owner_id)
                            SELECT id, key, value, owner_id FROM settings`, (err) => {
                        if (!err) {
                            db.run(`DROP TABLE settings`);
                            db.run(`ALTER TABLE settings_new RENAME TO settings`);
                        }
                    });
                    
                    // Recreate stock table to remove UNIQUE on `variant_id` and add UNIQUE(variant_id, owner_id)
                    // Wait, variant_id belongs to a product_variant, which belongs to an owner. 
                    // But to be completely safe, we shouldn't have UNIQUE just on variant_id if it causes issues, but variant_id itself is globally unique per DB, so UNIQUE(variant_id) is actually fine! Because one variant_id only belongs to one owner anyway. We will keep it as is, just with owner_id column.

                    db.run('COMMIT', (err) => {
                        if (err) { db.run('ROLLBACK'); return reject(err); }
                        resolve();
                    });
                } catch (error) {
                    db.run('ROLLBACK');
                    reject(error);
                }
            };
            
            migrate();
        });
    });
    }
};
