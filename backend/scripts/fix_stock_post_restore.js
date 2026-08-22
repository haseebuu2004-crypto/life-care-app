require('dotenv').config();
const pool = require('./config/db');

async function fixRestoredStock() {
    try {
        console.log("Deducting restored sales from stock...");
        
        const updateQuery = `
            UPDATE stock s
            SET quantity = quantity - COALESCE((
                SELECT SUM(si.quantity) 
                FROM sale_items si 
                JOIN sales sa ON si.sale_id = sa.id 
                WHERE si.product_version_id = s.product_version_id 
                AND sa.owner_id = s.owner_id 
                AND sa.is_deleted = false
            ), 0)
            RETURNING s.product_version_id, s.quantity;
        `;
        
        const updateRes = await pool.query(updateQuery);
        console.log("Stock adjusted successfully for variants:", updateRes.rows);
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
fixRestoredStock();
