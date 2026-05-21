module.exports = {
    up: async function(db) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

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
                        // We are migrating the integer owner_id to be a string based on email/username.
                        // For each user in the users table, update all business tables where owner_id = user.id
                        // to be the string value: user.email or user.username
                        
                        db.all("SELECT id, username, email FROM users", async (err, users) => {
                            if (err) {
                                db.run('ROLLBACK');
                                return reject(err);
                            }

                            try {
                                for (const user of users) {
                                    const stableOwnerId = user.email ? user.email.trim().toLowerCase() : (user.username || String(user.id));
                                    const oldId = user.id;

                                    // Cast stableOwnerId as a string explicitly in the query to update the integer columns
                                    // SQLite allows TEXT in INTEGER columns (type affinity).
                                    await runQuery('UPDATE products SET owner_id = ? WHERE owner_id = ?', [stableOwnerId, oldId]);
                                    await runQuery('UPDATE product_variants SET owner_id = ? WHERE owner_id = ?', [stableOwnerId, oldId]);
                                    await runQuery('UPDATE stock SET owner_id = ? WHERE owner_id = ?', [stableOwnerId, oldId]);
                                    await runQuery('UPDATE sales SET owner_id = ? WHERE owner_id = ?', [stableOwnerId, oldId]);
                                    await runQuery('UPDATE sale_items SET owner_id = ? WHERE owner_id = ?', [stableOwnerId, oldId]);
                                    await runQuery('UPDATE attendance SET owner_id = ? WHERE owner_id = ?', [stableOwnerId, oldId]);
                                    await runQuery('UPDATE settings SET owner_id = ? WHERE owner_id = ?', [stableOwnerId, oldId]);
                                }

                                await runQuery('COMMIT');
                                resolve();
                            } catch (e) {
                                db.run('ROLLBACK');
                                reject(e);
                            }
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
