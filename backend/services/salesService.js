const pool = require('../config/db');

exports.getAllSales = async (ownerId) => {
    const { rows } = await pool.query(`
        SELECT s.id as id, si.id as item_id, s.date, s.customer, pv.flavor, p.name as product_name, si.qty, si.sale_price, si.total_amount, si.profit, si.variant_id as stock_id
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        LEFT JOIN product_variants pv ON si.variant_id = pv.id
        LEFT JOIN products p ON pv.product_id = p.id
        WHERE s.owner_id = $1
        ORDER BY s.date DESC
    `, [ownerId]);
    return rows;
};

exports.addSaleTransaction = async (date, customerName, uniqueProducts, ownerId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const insertSaleRes = await client.query(
            'INSERT INTO sales (date, customer, total_amount, total_profit, owner_id) VALUES ($1, $2, 0, 0, $3) RETURNING id', 
            [date, customerName, ownerId]
        );
        const saleId = insertSaleRes.rows[0].id;
        
        let saleTotalAmount = 0;
        let saleTotalProfit = 0;

        for (const p of uniqueProducts) {
            const stockRes = await client.query(`
                SELECT s.qty, pr.name as product_name, pv.flavor, pv.sp as cost_price
                FROM stock s 
                JOIN product_variants pv ON s.variant_id = pv.id
                JOIN products pr ON pv.product_id = pr.id
                WHERE s.variant_id = $1 AND s.owner_id = $2
            `, [p.stock_id, ownerId]);
            
            const row = stockRes.rows[0];
            
            if (!row) {
                throw new Error("Invalid product variant selected.");
            }
            
            if (row.qty < p.quantity) {
                const flavorText = row.flavor && row.flavor !== 'Base' ? ` (${row.flavor})` : '';
                throw new Error(`Only ${row.qty} units available for ${row.product_name}${flavorText}`);
            }

            // Perform secure server-side calculations
            const costPrice = parseFloat(row.cost_price) || 0;
            const requestedSellingPrice = parseFloat(p.sale_price) || 0;
            
            const backendTotalAmount = requestedSellingPrice * p.quantity;
            const backendProfit = (requestedSellingPrice - costPrice) * p.quantity;

            await client.query('UPDATE stock SET qty = qty - $1 WHERE variant_id = $2 AND owner_id = $3', [p.quantity, p.stock_id, ownerId]);
            
            await client.query(
                'INSERT INTO sale_items (sale_id, variant_id, qty, sale_price, total_amount, profit, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [saleId, p.stock_id, p.quantity, requestedSellingPrice, backendTotalAmount, backendProfit, ownerId]
            );
            
            saleTotalAmount += backendTotalAmount;
            saleTotalProfit += backendProfit;
        }

        await client.query('UPDATE sales SET total_amount = $1, total_profit = $2 WHERE id = $3 AND owner_id = $4', [saleTotalAmount, saleTotalProfit, saleId, ownerId]);
        
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

exports.deleteSaleTransaction = async (id, ownerId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const saleRes = await client.query('SELECT id FROM sales WHERE id = $1 AND owner_id = $2', [id, ownerId]);
        if (saleRes.rows.length === 0) {
            throw new Error("Sale not found");
        }

        const itemsRes = await client.query('SELECT variant_id, qty FROM sale_items WHERE sale_id = $1 AND owner_id = $2', [id, ownerId]);
        const items = itemsRes.rows;

        for (const item of items) {
            await client.query('UPDATE stock SET qty = qty + $1 WHERE variant_id = $2 AND owner_id = $3', [item.qty, item.variant_id, ownerId]);
        }

        await client.query('DELETE FROM sale_items WHERE sale_id = $1 AND owner_id = $2', [id, ownerId]);
        await client.query('DELETE FROM sales WHERE id = $1 AND owner_id = $2', [id, ownerId]);
        
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};
