require('dotenv').config();
const pool = require('./config/db');

async function analyze() {
    const stockRes = await pool.query('SELECT product_version_id, quantity FROM stock');
    console.log("Current Stock:", stockRes.rows);
    
    const salesRes = await pool.query(`
        SELECT product_version_id, SUM(quantity) as total_sold 
        FROM sale_items si 
        JOIN sales s ON si.sale_id = s.id 
        WHERE s.is_deleted = false 
        GROUP BY product_version_id
    `);
    console.log("Total Sold in DB:", salesRes.rows);
    
    process.exit(0);
}
analyze();
