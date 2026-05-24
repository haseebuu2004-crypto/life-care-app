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
            data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
            return { type, data };
        } else if (originalName.endsWith('.xlsx')) {
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            if (type === 'full') {
                return {
                    type: 'full',
                    data: {
                        sales: workbook.Sheets['Sales'] ? xlsx.utils.sheet_to_json(workbook.Sheets['Sales']) : [],
                        attendance: workbook.Sheets['Attendance'] ? xlsx.utils.sheet_to_json(workbook.Sheets['Attendance']) : [],
                        products: workbook.Sheets['Products'] ? xlsx.utils.sheet_to_json(workbook.Sheets['Products']) : []
                    }
                };
            } else {
                const sheetName = workbook.SheetNames[0];
                data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
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

        // Group rows by date, customer, and total_profit (since a single sale transaction has multiple items)
        const groupedSales = {};
        for (const row of records) {
            if (!row.date || !row.customer) continue;
            
            const key = `${row.date}_${row.customer}_${row.total_profit || 0}`;
            if (!groupedSales[key]) {
                groupedSales[key] = {
                    date: row.date,
                    customer: row.customer,
                    total_profit: row.total_profit || 0,
                    items: []
                };
            }
            if (row.product_name) {
                groupedSales[key].items.push({
                    product_name: row.product_name,
                    flavor: row.flavor,
                    qty: row.qty || 1
                });
            }
        }

        for (const key in groupedSales) {
            const sale = groupedSales[key];
            
            if (strategy === 'merge') {
                // Check if sale already exists on this date for this customer
                const { rows: existing } = await client.query(
                    'SELECT id FROM sales WHERE DATE(date) = DATE($1) AND customer = $2 AND owner_id = $3 LIMIT 1',
                    [sale.date, sale.customer, ownerId]
                );
                
                // If it already exists, we skip it to prevent duplicating items or messing up stock
                // (Merge strategy only inserts missing sales)
                if (existing.length > 0) continue;
            }

            // Insert missing sale
            const insertSaleRes = await client.query(
                'INSERT INTO sales (date, customer, total_amount, total_profit, owner_id) VALUES ($1, $2, 0, $3, $4) RETURNING id',
                [sale.date, sale.customer, sale.total_profit, ownerId]
            );
            const saleId = insertSaleRes.rows[0].id;

            let saleTotalAmount = 0;

            for (const item of sale.items) {
                let variantId = null;
                let salePrice = 0;
                
                const { rows: variants } = await client.query(`
                    SELECT pv.id, pv.sp
                    FROM product_variants pv
                    JOIN products p ON pv.product_id = p.id
                    WHERE p.name = $1 AND pv.flavor = $2 AND p.owner_id = $3
                `, [item.product_name, item.flavor || 'Base', ownerId]);
                
                if (variants.length > 0) {
                    variantId = variants[0].id;
                    salePrice = variants[0].sp || 0;
                }

                if (variantId) {
                    // Deduct stock to respect business logic
                    await client.query('UPDATE stock SET qty = qty - $1 WHERE variant_id = $2 AND owner_id = $3', [item.qty, variantId, ownerId]);
                    
                    const itemTotal = salePrice * item.qty;
                    saleTotalAmount += itemTotal;
                    
                    await client.query(
                        'INSERT INTO sale_items (sale_id, variant_id, qty, sale_price, total_amount, profit, owner_id) VALUES ($1, $2, $3, $4, $5, 0, $6)',
                        [saleId, variantId, item.qty, salePrice, itemTotal, ownerId]
                    );
                }
            }

            // Update total amount on the parent sale
            await client.query('UPDATE sales SET total_amount = $1 WHERE id = $2', [saleTotalAmount, saleId]);
        }
    }
}

module.exports = new RestoreService();
