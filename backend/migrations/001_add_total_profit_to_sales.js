module.exports = {
    up: (db) => {
        return new Promise((resolve, reject) => {
            db.all("PRAGMA table_info(sales)", (err, rows) => {
                if (err) return reject(err);

                const existingColumns = rows.map(r => r.name);
                const columnsToAdd = [];

                if (!existingColumns.includes('total_profit')) {
                    columnsToAdd.push("ALTER TABLE sales ADD COLUMN total_profit REAL DEFAULT 0");
                }
                
                if (!existingColumns.includes('total_sales')) {
                    // Note: 'total_amount' is already used by the app, but user requested 'total_sales' as fallback
                    columnsToAdd.push("ALTER TABLE sales ADD COLUMN total_sales REAL DEFAULT 0");
                }

                if (!existingColumns.includes('created_at')) {
                    columnsToAdd.push("ALTER TABLE sales ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");
                }

                if (!existingColumns.includes('updated_at')) {
                    columnsToAdd.push("ALTER TABLE sales ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP");
                }

                if (columnsToAdd.length === 0) {
                    return resolve();
                }

                const processColumn = (index) => {
                    if (index >= columnsToAdd.length) {
                        return resolve();
                    }
                    db.run(columnsToAdd[index], (err) => {
                        if (err) {
                            console.error(`Error adding column: ${columnsToAdd[index]}`, err);
                            return reject(err);
                        }
                        processColumn(index + 1);
                    });
                };

                processColumn(0);
            });
        });
    }
};
