const pool = require('../shared/db/connection');

class MigrationValidator {
    async validate() {
        console.log("Running pre-flight validation...");
        const client = await pool.pool.connect();
        try {
            const prodRes = await client.query('SELECT name, count(*) FROM products GROUP BY name HAVING count(*) > 1');
            if (prodRes.rows.length > 0) {
                console.error("Validation FAIL: Duplicate products found.");
                return false;
            }
            
            const stockRes = await client.query('SELECT count(*) FROM stock WHERE product_version_id NOT IN (SELECT id FROM product_versions)');
            if (parseInt(stockRes.rows[0].count) > 0) {
                console.error("Validation FAIL: Orphan stock found.");
                return false;
            }

            console.log("Validation PASS");
            return true;
        } catch (e) {
            console.error("Validation error:", e);
            return false;
        } finally {
            client.release();
        }
    }
}

module.exports = new MigrationValidator();
