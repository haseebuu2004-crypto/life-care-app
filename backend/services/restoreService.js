const pool = require('../config/db');
const xlsx = require('xlsx');

class RestoreService {
    async parseFile(buffer, mimetype, originalName) {
        let data = [];
        let type = 'unknown';

        if (originalName.toLowerCase().includes('sales')) type = 'sales';
        else if (originalName.toLowerCase().includes('attendance')) type = 'attendance';
        else if (originalName.toLowerCase().includes('customers')) type = 'customers';
        else if (originalName.toLowerCase().includes('products')) type = 'products';
        else if (originalName.toLowerCase().includes('full')) type = 'full';

        if (mimetype === 'text/csv' || originalName.endsWith('.csv')) {
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });
            return { type, data };
        } else if (originalName.endsWith('.xlsx')) {
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            if (type === 'full') {
                return {
                    type: 'full',
                    data: {
                        sales: workbook.Sheets['Sales'] ? xlsx.utils.sheet_to_json(workbook.Sheets['Sales'], { raw: false }) : [],
                        attendance: workbook.Sheets['Attendance'] ? xlsx.utils.sheet_to_json(workbook.Sheets['Attendance'], { raw: false }) : [],
                        products: workbook.Sheets['Products'] ? xlsx.utils.sheet_to_json(workbook.Sheets['Products'], { raw: false }) : []
                    }
                };
            } else {
                const sheetName = workbook.SheetNames[0];
                data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });
                return { type, data };
            }
        } else {
            throw new Error('Unsupported file format. Please upload CSV or Excel.');
        }
    }

    async validateRestore(data, type) {
        // Dry-run validation logic
        if (type === 'full') {
            return {
                message: `Ready to restore ${data.sales?.length || 0} sales, ${data.attendance?.length || 0} attendance records, and ${data.products?.length || 0} products.`,
                valid: true
            };
        } else {
            return {
                message: `Ready to restore ${data.length} records to ${type}.`,
                valid: true
            };
        }
    }

    async executeRestore(ownerId, type, data, strategy) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            if (type === 'attendance') {
                await this.restoreAttendance(client, ownerId, data, strategy);
            } else if (type === 'sales') {
                await this.restoreSales(client, ownerId, data, strategy);
            } else if (type === 'products') {
                throw new Error('Products restore not fully implemented in this preview version.');
            } else if (type === 'full') {
                if (data.attendance) await this.restoreAttendance(client, ownerId, data.attendance, strategy);
                if (data.sales) await this.restoreSales(client, ownerId, data.sales, strategy);
            } else {
                throw new Error('Unsupported restore type.');
            }

            await client.query('COMMIT');
            return { success: true, message: `Successfully restored ${type} using ${strategy} strategy.` };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Restore Error:', error);
            throw new Error(`Restore failed and was rolled back: ${error.message}`);
        } finally {
            client.release();
        }
    }

    async restoreAttendance(client, ownerId, records, strategy) {
        if (strategy === 'wipe') {
            await client.query('DELETE FROM attendance WHERE owner_id = $1', [ownerId]);
        }

        for (const row of records) {
            if (!row.name || !row.date) continue;
            const status = row.status || 'Absent';
            const deduction = row.others_deduction || 0;
            const profit = row.shake_profit || (status === 'Present' ? 50 : 0);

            if (strategy === 'merge') {
                // Upsert logic
                const { rows: existing } = await client.query(
                    'SELECT id FROM attendance WHERE DATE(date) = DATE($1) AND name = $2 AND owner_id = $3',
                    [row.date, row.name, ownerId]
                );

                if (existing.length > 0) {
                    await client.query(
                        'UPDATE attendance SET status = $1, others_deduction = $2, shake_profit = $3 WHERE id = $4',
                        [status, deduction, profit, existing[0].id]
                    );
                } else {
                    await client.query(
                        'INSERT INTO attendance (date, name, status, others_deduction, shake_profit, owner_id) VALUES ($1, $2, $3, $4, $5, $6)',
                        [row.date, row.name, status, deduction, profit, ownerId]
                    );
                }
            } else {
                // Wipe already deleted, so just insert
                await client.query(
                    'INSERT INTO attendance (date, name, status, others_deduction, shake_profit, owner_id) VALUES ($1, $2, $3, $4, $5, $6)',
                    [row.date, row.name, status, deduction, profit, ownerId]
                );
            }
        }
    }

    async restoreSales(client, ownerId, records, strategy) {
        if (strategy === 'wipe') {
            await client.query('DELETE FROM sales WHERE owner_id = $1', [ownerId]);
        }

        for (const row of records) {
            if (!row.date || !row.customer || !row.product_name) continue;

            const flavor = row.flavor || 'Base';
            const rowProfit = parseFloat(row.total_profit) || 0;
            const itemQty = parseFloat(row.qty) || 1;

            if (strategy === 'merge') {
                // Look for THIS EXACT ITEM in the database
                const { rows: existing } = await client.query(`
                    SELECT s.id 
                    FROM sales s
                    JOIN sale_items si ON s.id = si.sale_id
                    JOIN product_variants pv ON si.variant_id = pv.id
                    JOIN products p ON pv.product_id = p.id
                    WHERE DATE(s.date) = DATE($1) 
                      AND s.customer = $2 
                      AND s.total_profit = $3 
                      AND p.name = $4 
                      AND pv.flavor = $5 
                      AND s.owner_id = $6 
                    LIMIT 1
                `, [row.date, row.customer, rowProfit, row.product_name, flavor, ownerId]);
                
                if (existing.length > 0) continue; // Item exists, skip!
            }

            // Item is missing! We must restore it to preserve its individual rate
            let variantId = null;
            let costPrice = 0;
            
            const { rows: variants } = await client.query(`
                SELECT pv.id, pv.sp
                FROM product_variants pv
                JOIN products p ON pv.product_id = p.id
                WHERE p.name = $1 AND pv.flavor = $2 AND p.owner_id = $3
            `, [row.product_name, flavor, ownerId]);
            
            if (variants.length > 0) {
                variantId = variants[0].id;
                costPrice = parseFloat(variants[0].sp) || 0;
            }

            if (variantId) {
                // Recalculate proper rates based on the exported profit and live cost
                const itemProfit = rowProfit;
                const itemTotalAmount = (costPrice * itemQty) + itemProfit;
                const salePrice = itemTotalAmount / itemQty;

                // Deduct stock safely
                await client.query('UPDATE stock SET qty = qty - $1 WHERE variant_id = $2 AND owner_id = $3', [itemQty, variantId, ownerId]);

                // Create a fresh sale for this item to preserve exact financial math
                const insertSaleRes = await client.query(
                    'INSERT INTO sales (date, customer, total_amount, total_profit, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    [row.date, row.customer, itemTotalAmount, itemProfit, ownerId]
                );
                const saleId = insertSaleRes.rows[0].id;
                
                // Insert the item with fully reconstructed rates
                await client.query(
                    'INSERT INTO sale_items (sale_id, variant_id, qty, sale_price, total_amount, profit, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [saleId, variantId, itemQty, salePrice, itemTotalAmount, itemProfit, ownerId]
                );
            }
        }
    }
}

module.exports = new RestoreService();
