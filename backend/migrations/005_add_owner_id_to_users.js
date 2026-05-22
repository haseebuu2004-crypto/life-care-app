module.exports = {
    up: async (pool) => {
        // 1. Add owner_id column
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS owner_id VARCHAR(255)`);

        // 2. Migrate existing users to have their own owner_id derived from email or username
        // This preserves the old logic where an admin was their own workspace
        await pool.query(`
            UPDATE users 
            SET owner_id = COALESCE(NULLIF(TRIM(LOWER(email)), ''), username, CAST(id AS VARCHAR)) 
            WHERE owner_id IS NULL
        `);

        // 3. Drop the old global unique constraint on username
        // Note: The constraint name varies depending on how the table was created.
        // It's usually "users_username_key" in PostgreSQL
        try {
            await pool.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key`);
        } catch (e) {
            console.warn("Could not drop users_username_key constraint, it may have a different name.", e.message);
        }

        // 4. Add the new composite unique constraint (username + owner_id)
        try {
            await pool.query(`ALTER TABLE users ADD CONSTRAINT users_username_owner_key UNIQUE (username, owner_id)`);
        } catch (e) {
            console.warn("Could not add users_username_owner_key constraint, it might already exist.", e.message);
        }
    }
};
