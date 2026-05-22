module.exports = {
    up: async (pool) => {
        const tables = [
            'products', 'product_variants', 'stock', 
            'sales', 'sale_items', 'attendance', 'settings'
        ];
        
        for (const table of tables) {
            await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS owner_id VARCHAR(255)`);
        }
    }
};
