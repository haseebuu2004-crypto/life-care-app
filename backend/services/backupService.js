const pool = require('../config/db');
const xlsx = require('xlsx');
const { createObjectCsvStringifier } = require('csv-writer');

class BackupService {
    async getExportData(type, ownerId) {
        let query = '';
        let params = [ownerId];

        switch (type.toLowerCase()) {
            case 'customers':
                // For now, customers are derived from sales/attendance or users if there is a table
                query = `SELECT DISTINCT name as customer_name, MAX(date) as last_active 
                         FROM (
                             SELECT customer as name, date FROM sales WHERE owner_id = $1
                             UNION ALL
                             SELECT name, date FROM attendance WHERE owner_id = $1
                         ) as combined
                         GROUP BY name ORDER BY last_active DESC`;
                break;
            case 'sales':
                query = `
                    SELECT s.id, s.date, s.customer, s.total_profit, si.variant_id, si.qty, p.name as product_name, pv.flavor 
                    FROM sales s
                    LEFT JOIN sale_items si ON s.id = si.sale_id
                    LEFT JOIN product_variants pv ON si.variant_id = pv.id
                    LEFT JOIN products p ON pv.product_id = p.id
                    WHERE s.owner_id = $1
                    ORDER BY s.date DESC
                `;
                break;
            case 'attendance':
                query = `SELECT id, date, name, status, others_deduction, shake_profit FROM attendance WHERE owner_id = $1 ORDER BY date DESC`;
                break;
            case 'products':
                query = `
                    SELECT p.id as product_id, p.name, pv.id as variant_id, pv.flavor, pv.vp, pv.sp, s.qty
                    FROM products p
                    JOIN product_variants pv ON p.id = pv.product_id
                    LEFT JOIN stock s ON pv.id = s.variant_id
                    WHERE p.owner_id = $1 AND pv.is_active = 1
                `;
                break;
            case 'full':
                // Full returns multiple datasets
                const [sales, attendance, products] = await Promise.all([
                    this.getExportData('sales', ownerId),
                    this.getExportData('attendance', ownerId),
                    this.getExportData('products', ownerId)
                ]);
                return { sales, attendance, products };
            default:
                throw new Error('Invalid backup type');
        }

        const { rows } = await pool.query(query, params);
        return rows;
    }

    async generateExcel(data, type) {
        const workbook = xlsx.utils.book_new();
        
        if (type.toLowerCase() === 'full') {
            const salesSheet = xlsx.utils.json_to_sheet(data.sales);
            const attendanceSheet = xlsx.utils.json_to_sheet(data.attendance);
            const productsSheet = xlsx.utils.json_to_sheet(data.products);
            
            xlsx.utils.book_append_sheet(workbook, salesSheet, 'Sales');
            xlsx.utils.book_append_sheet(workbook, attendanceSheet, 'Attendance');
            xlsx.utils.book_append_sheet(workbook, productsSheet, 'Products');
        } else {
            const sheet = xlsx.utils.json_to_sheet(data);
            xlsx.utils.book_append_sheet(workbook, sheet, type);
        }

        return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    async generateCSV(data, type) {
        if (type.toLowerCase() === 'full') {
            throw new Error('CSV format does not support multi-sheet full backups. Use Excel.');
        }

        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]).map(key => ({ id: key, title: key }));
        const csvStringifier = createObjectCsvStringifier({ header: headers });
        
        const headerRow = csvStringifier.getHeaderString();
        const bodyRows = csvStringifier.stringifyRecords(data);
        
        return headerRow + bodyRows;
    }

    generateFileName(type, format) {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '_');
        const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
        return `backup_${type.toLowerCase()}_${dateStr}_${timeStr}.${format}`;
    }
}

module.exports = new BackupService();
