const fs = require('fs');
const path = require('path');

function runMigrations(db) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error("Migration Error: Failed to create migrations table", err);
                    return reject(err);
                }

                db.all(`SELECT name FROM migrations`, [], (err, rows) => {
                    if (err) return reject(err);

                    const executedMigrations = rows.map(r => r.name);
                    const migrationsDir = __dirname;
                    
                    fs.readdir(migrationsDir, (err, files) => {
                        if (err) return reject(err);

                        // Get all .js files except index.js, sort them alphabetically
                        const migrationFiles = files
                            .filter(f => f.endsWith('.js') && f !== 'index.js')
                            .sort();

                        let pendingMigrations = migrationFiles.filter(f => !executedMigrations.includes(f));

                        if (pendingMigrations.length === 0) {
                            return resolve();
                        }

                        console.log(`Found ${pendingMigrations.length} pending migrations.`);

                        const processNext = (index) => {
                            if (index >= pendingMigrations.length) {
                                return resolve();
                            }

                            const filename = pendingMigrations[index];
                            const migration = require(path.join(migrationsDir, filename));
                            
                            console.log(`Running migration: ${filename}`);
                            
                            migration.up(db)
                                .then(() => {
                                    db.run(`INSERT INTO migrations (name) VALUES (?)`, [filename], (err) => {
                                        if (err) return reject(err);
                                        console.log(`✅ Migration completed: ${filename}`);
                                        processNext(index + 1);
                                    });
                                })
                                .catch(err => {
                                    console.error(`❌ Migration failed: ${filename}`, err);
                                    reject(err);
                                });
                        };

                        processNext(0);
                    });
                });
            });
        });
    });
}

module.exports = runMigrations;
