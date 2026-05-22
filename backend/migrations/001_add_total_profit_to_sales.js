module.exports = {
    up: async (pool) => {
        const queries = [
            "ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_profit REAL DEFAULT 0",
            "ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_sales REAL DEFAULT 0",
            "ALTER TABLE sales ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE sales ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
        ];
        
        for (const q of queries) {
            await pool.query(q);
        }
    }
};
