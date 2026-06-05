const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const db = require('../db');
const audit = require('../services/auditLogService');
const { generateReportHTML } = require('../utils/reportTemplate');

exports.exportPDF = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const type = req.query.type || req.params.type || 'summary';
        const range = req.query.range || 'all';

        let dateFilterSales = '';
        let dateFilterAttendance = '';
        
        if (range === 'weekly') {
            dateFilterSales = `AND s.sale_date >= CURRENT_DATE - INTERVAL '7 days'`;
            dateFilterAttendance = `AND a.attendance_date >= CURRENT_DATE - INTERVAL '7 days'`;
        } else if (range === 'monthly') {
            dateFilterSales = `AND date_trunc('month', s.sale_date) = date_trunc('month', CURRENT_DATE)`;
            dateFilterAttendance = `AND date_trunc('month', a.attendance_date) = date_trunc('month', CURRENT_DATE)`;
        }

        let data = { range };

        if (type === 'sales') {
            const result = await db.query(`
                SELECT 
                    s.sale_date, c.name as customer, p.name as product, 
                    si.quantity, si.price_charged,
                    ((si.price_charged - si.vendor_price_snap) * si.quantity) as item_profit
                FROM sales s
                JOIN customers c ON s.customer_id = c.id
                JOIN sale_items si ON si.sale_id = s.id
                JOIN product_versions pv ON si.product_version_id = pv.id
                JOIN products p ON pv.product_id = p.id
                WHERE s.owner_id = $1 AND s.is_deleted = false
                ${dateFilterSales}
                ORDER BY s.sale_date DESC
            `, [ownerId]);

            let total = 0;
            result.rows.forEach(r => {
                total += (r.price_charged * r.quantity) / 100;
            });
            data = { ...data, rows: result.rows, total };
        } 
        else if (type === 'attendance') {
            const result = await db.query(`
                SELECT a.attendance_date, c.name, a.type, a.shake_amount
                FROM attendance a
                JOIN customers c ON a.customer_id = c.id
                WHERE a.owner_id = $1 AND a.is_deleted = false
                ${dateFilterAttendance}
                ORDER BY a.attendance_date DESC
            `, [ownerId]);

            let profit = 0;
            result.rows.forEach(r => {
                profit += r.shake_amount / 100;
            });
            data = { ...data, rows: result.rows, profit };
        }
        else if (type === 'summary') {
            const salesRes = await db.query(`
                SELECT 
                    SUM(si.price_charged * si.quantity) as rev, 
                    SUM((si.price_charged - si.vendor_price_snap) * si.quantity) as prof 
                FROM sales s
                JOIN sale_items si ON s.id = si.sale_id
                WHERE s.owner_id = $1 AND s.is_deleted = false
                ${dateFilterSales}
            `, [ownerId]);
            const attRes = await db.query(`
                SELECT SUM(shake_amount) as att_prof 
                FROM attendance a
                WHERE a.owner_id = $1 AND a.is_deleted = false
                ${dateFilterAttendance}
            `, [ownerId]);
            const custRes = await db.query(`SELECT COUNT(*) as count FROM customers WHERE owner_id = $1 AND is_active = true`, [ownerId]);
            
            // Fetch lists for summary
            const salesList = await db.query(`
                SELECT 
                    s.sale_date, c.name as customer, p.name as product, 
                    si.quantity, si.price_charged,
                    ((si.price_charged - si.vendor_price_snap) * si.quantity) as item_profit
                FROM sales s
                JOIN customers c ON s.customer_id = c.id
                JOIN sale_items si ON si.sale_id = s.id
                JOIN product_versions pv ON si.product_version_id = pv.id
                JOIN products p ON pv.product_id = p.id
                WHERE s.owner_id = $1 AND s.is_deleted = false
                ${dateFilterSales}
                ORDER BY s.sale_date DESC
            `, [ownerId]);
            
            const attendanceList = await db.query(`
                SELECT a.attendance_date, c.name, a.type, a.shake_amount
                FROM attendance a
                JOIN customers c ON a.customer_id = c.id
                WHERE a.owner_id = $1 AND a.is_deleted = false
                ${dateFilterAttendance}
                ORDER BY a.attendance_date DESC
            `, [ownerId]);

            data = {
                ...data,
                sales: salesRes.rows[0],
                attendance: attRes.rows[0],
                customers: custRes.rows[0],
                salesList: salesList.rows,
                attendanceList: attendanceList.rows
            };
        }

        const adminConfigRes = await db.query('SELECT club_name FROM admin_config WHERE owner_id = $1', [ownerId]);
        const clubName = adminConfigRes.rows[0]?.club_name || '';

        const html = generateReportHTML(type, data, clubName);

        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({ 
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });
        
        await browser.close();

        const slug = clubName ? `${clubName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_` : '';
        const filename = `${slug}${type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');
        res.send(pdfBuffer);

        await audit.logAction(req.user.id, 'EXPORT_PDF', type, null);
    } catch (e) {
        console.error("PDF Export Error:", e);
        if (!res.headersSent) res.status(500).json({ success: false, message: "Export failed" });
    }
};

exports.exportExcel = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        
        const adminConfigRes = await db.query('SELECT club_name FROM admin_config WHERE owner_id = $1', [ownerId]);
        const clubName = adminConfigRes.rows[0]?.club_name || '';
        
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Life Care System';

        // 1. Customers Sheet
        const custSheet = workbook.addWorksheet('Customers');
        custSheet.columns = [
            { header: 'ID', key: 'id', width: 40 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Joined', key: 'joined_at', width: 15 },
        ];
        const customers = await db.query(`SELECT * FROM customers WHERE owner_id = $1`, [ownerId]);
        custSheet.addRows(customers.rows);

        // 2. Sales Sheet
        const saleSheet = workbook.addWorksheet('Sales');
        saleSheet.columns = [
            { header: 'Sale ID', key: 'sale_id', width: 40 },
            { header: 'Date', key: 'sale_date', width: 15 },
            { header: 'Customer', key: 'customer', width: 30 },
            { header: 'Product', key: 'product', width: 30 },
            { header: 'Quantity', key: 'qty', width: 10 },
            { header: 'Price Charged (Paise)', key: 'price', width: 15 },
        ];
        const sales = await db.query(`
            SELECT s.id as sale_id, s.sale_date, c.name as customer, p.name as product, si.quantity as qty, si.price_charged as price
            FROM sales s
            JOIN customers c ON s.customer_id = c.id
            JOIN sale_items si ON si.sale_id = s.id
            JOIN product_versions pv ON si.product_version_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE s.owner_id = $1 AND s.is_deleted = false
        `, [ownerId]);
        saleSheet.addRows(sales.rows);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        const slug = clubName ? `${clubName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_` : '';
        const filename = `${slug}backup_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        await workbook.xlsx.write(res);
        res.end();
        
        await audit.logAction(req.user.id, 'EXPORT_EXCEL', 'full_backup', null);
    } catch (e) {
        console.error("Excel Export Error:", e);
        if (!res.headersSent) res.status(500).json({ success: false, message: "Export failed" });
    }
};
