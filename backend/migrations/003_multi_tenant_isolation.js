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

            const runQuery = (query, params = []) => {
                return new Promise((res, rej) => {
                    db.run(query, params, (err) => {
                        if (err) rej(err);
                        else res();
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
                    await runQuery(`UPDATE products SET owner_id = 1 WHERE owner_id IS NULL`);
                    await runQuery(`UPDATE product_variants SET owner_id = 1 WHERE owner_id IS NULL`);
                    await runQuery(`UPDATE stock SET owner_id = 1 WHERE owner_id IS NULL`);
                    await runQuery(`UPDATE sales SET owner_id = 1 WHERE owner_id IS NULL`);
                    await runQuery(`UPDATE sale_items SET owner_id = 1 WHERE owner_id IS NULL`);
                    await runQuery(`UPDATE attendance SET owner_id = 1 WHERE owner_id IS NULL`);
                    await runQuery(`UPDATE settings SET owner_id = 1 WHERE owner_id IS NULL`);

                    // Recreate products table to remove UNIQUE on just `name` and add UNIQUE(name, owner_id)
                    await runQuery(`CREATE TABLE IF NOT EXISTS products_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        is_active INTEGER DEFAULT 1,
                        owner_id INTEGER,
                        UNIQUE(name, owner_id)
                    )`);

                    await runQuery(`INSERT INTO products_new (id, name, created_at, is_active, owner_id)
                            SELECT id, name, created_at, is_active, owner_id FROM products`);
                    
                    await runQuery(`DROP TABLE products`);
                    await runQuery(`ALTER TABLE products_new RENAME TO products`);
                    await runQuery(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`);

                    // Recreate settings to remove UNIQUE on `key`
                    await runQuery(`CREATE TABLE IF NOT EXISTS settings_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        key TEXT,
                        value TEXT,
                        owner_id INTEGER,
                        UNIQUE(key, owner_id)
                    )`);

                    await runQuery(`INSERT INTO settings_new (id, key, value, owner_id)
                            SELECT id, key, value, owner_id FROM settings`);
                    
                    await runQuery(`DROP TABLE settings`);
                    await runQuery(`ALTER TABLE settings_new RENAME TO settings`);
                    
                    await runQuery('COMMIT');
                    resolve();
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
