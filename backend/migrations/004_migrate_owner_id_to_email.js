module.exports = {
    up: async (pool) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { rows: users } = await client.query("SELECT id, username, email FROM users");
            
            for (const user of users) {
                const stableOwnerId = user.email ? user.email.trim().toLowerCase() : (user.username || String(user.id));
                const oldId = String(user.id);
                
                await client.query('UPDATE products SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
                await client.query('UPDATE product_variants SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
                await client.query('UPDATE stock SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
                await client.query('UPDATE sales SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
                await client.query('UPDATE sale_items SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
                await client.query('UPDATE attendance SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
                await client.query('UPDATE settings SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
            }
            
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
};
