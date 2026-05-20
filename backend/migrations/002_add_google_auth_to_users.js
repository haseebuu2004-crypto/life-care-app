module.exports = {
    up: (db) => {
        return new Promise((resolve, reject) => {
            db.all("PRAGMA table_info(users)", (err, rows) => {
                if (err) return reject(err);

                const existingColumns = rows.map(r => r.name);
                const columnsToAdd = [];

                if (!existingColumns.includes('email')) {
                    columnsToAdd.push("ALTER TABLE users ADD COLUMN email TEXT");
                }
                
                if (!existingColumns.includes('google_id')) {
                    columnsToAdd.push("ALTER TABLE users ADD COLUMN google_id TEXT");
                }

                if (!existingColumns.includes('auth_provider')) {
                    columnsToAdd.push("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local'");
                }

                if (!existingColumns.includes('created_at')) {
                    columnsToAdd.push("ALTER TABLE users ADD COLUMN created_at DATETIME");
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
