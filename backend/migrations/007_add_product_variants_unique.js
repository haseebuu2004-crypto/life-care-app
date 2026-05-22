module.exports = {
    up: async (pool) => {
        try {
            await pool.query(`
                ALTER TABLE product_variants 
                ADD CONSTRAINT unique_product_flavor_owner 
                UNIQUE (product_id, flavor, owner_id)
            `);
            console.log("Added unique constraint on product_variants (product_id, flavor, owner_id)");
        } catch (error) {
            if (error.code === '42710') {
                console.log("Constraint unique_product_flavor_owner already exists.");
            } else if (error.code === '23505') {
                console.warn("Could not add unique constraint to product_variants: duplicate rows exist.");
            } else {
                console.error("Migration 007 Error:", error);
                throw error;
            }
        }
    }
};
