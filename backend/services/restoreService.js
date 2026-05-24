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
                    flavor: row.flavor || 'Base',
                    qty: row.qty || 1
                });
            }
        }

        for (const key in groupedSales) {
            const sale = groupedSales[key];
            let saleId = null;
            let existingItems = [];
            
            if (strategy === 'merge') {
                // Check if sale already exists on this date for this customer with same profit
                const { rows: existing } = await client.query(
                    'SELECT id FROM sales WHERE DATE(date) = DATE($1) AND customer = $2 AND total_profit = $3 AND owner_id = $4 LIMIT 1',
                    [sale.date, sale.customer, sale.total_profit, ownerId]
                );
                
                if (existing.length > 0) {
                    saleId = existing[0].id;
                    // Fetch items already in this sale to prevent duplicating them
                    const { rows: dbItems } = await client.query(`
                        SELECT p.name as product_name, pv.flavor 
                        FROM sale_items si 
                        JOIN product_variants pv ON si.variant_id = pv.id 
                        JOIN products p ON pv.product_id = p.id 
                        WHERE si.sale_id = $1
                    `, [saleId]);
                    existingItems = dbItems;
                }
            }

            // If sale doesn't exist, create a new one
            if (!saleId) {
                const insertSaleRes = await client.query(
                    'INSERT INTO sales (date, customer, total_amount, total_profit, owner_id) VALUES ($1, $2, 0, $3, $4) RETURNING id',
                    [sale.date, sale.customer, sale.total_profit, ownerId]
                );
                saleId = insertSaleRes.rows[0].id;
            }

            let saleTotalAmountAdded = 0;

            for (const item of sale.items) {
                // Check if item already exists in this sale (item-level merge)
                const itemExists = existingItems.some(dbItem => 
                    dbItem.product_name === item.product_name && 
                    dbItem.flavor === item.flavor
                );

                if (itemExists) continue; // Skip exact matches to prevent duplicate stock deductions

                let variantId = null;
                let salePrice = 0;
                
                const { rows: variants } = await client.query(`
                    SELECT pv.id, pv.sp
                    FROM product_variants pv
                    JOIN products p ON pv.product_id = p.id
                    WHERE p.name = $1 AND pv.flavor = $2 AND p.owner_id = $3
                `, [item.product_name, item.flavor, ownerId]);
                
                if (variants.length > 0) {
                    variantId = variants[0].id;
                    salePrice = variants[0].sp || 0;
                }

                if (variantId) {
                    // Deduct stock to safely respect business logic
                    await client.query('UPDATE stock SET qty = qty - $1 WHERE variant_id = $2 AND owner_id = $3', [item.qty, variantId, ownerId]);
                    
                    const itemTotal = salePrice * item.qty;
                    saleTotalAmountAdded += itemTotal;
                    
                    await client.query(
                        'INSERT INTO sale_items (sale_id, variant_id, qty, sale_price, total_amount, profit, owner_id) VALUES ($1, $2, $3, $4, $5, 0, $6)',
                        [saleId, variantId, item.qty, salePrice, itemTotal, ownerId]
                    );
                }
            }

            // Update total amount on the parent sale
            if (saleTotalAmountAdded > 0) {
                await client.query('UPDATE sales SET total_amount = total_amount + $1 WHERE id = $2', [saleTotalAmountAdded, saleId]);
            }
        }
    }
}

module.exports = new RestoreService();
