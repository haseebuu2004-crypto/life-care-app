const pool = require('../config/db');
const { getOwnerId } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

exports.getStats = async (req, res) => {
    try {
        const stats = {
            totals: {
                totalSalesProfit: 0,
                totalShakeProfit: 0,
                totalVpSold: 0,
                totalStockValue: 0,
                lowStockCount: 0,
                topSeller: 'N/A'
            },
            lowStockItems: [],
            monthlyProductSales: [],
            topCustomers: [],
            shakeProfitDetails: []
        };

        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const ownerId = getOwnerId(req);

        const [res1, res2, res3, res4, res5, res6, res7] = await Promise.all([
            pool.query(`SELECT SUM(total_profit) as "totalProfit" FROM sales WHERE owner_id = $1`, [ownerId]),
            pool.query(`SELECT SUM(pv.vp * si.qty) as "totalVp" FROM sale_items si JOIN product_variants pv ON si.variant_id = pv.id WHERE si.owner_id = $1`, [ownerId]),
            pool.query(`
                SELECT 
                    SUM(pv.sp * s.qty) as "stockValue",
                    COUNT(CASE WHEN s.qty < 5 THEN 1 END) as "lowStock"
                FROM stock s JOIN product_variants pv ON s.variant_id = pv.id
                WHERE s.owner_id = $1
            `, [ownerId]),
            pool.query(`
                SELECT s.id, p.name as product_name, pv.flavor, s.qty
                FROM stock s
                JOIN product_variants pv ON s.variant_id = pv.id
                JOIN products p ON pv.product_id = p.id
                WHERE s.qty < 5 AND s.owner_id = $1
                ORDER BY s.qty ASC
            `, [ownerId]),
            pool.query(`
                SELECT p.name, SUM(si.qty) as qty
                FROM sale_items si
                JOIN sales s ON si.sale_id = s.id
                JOIN product_variants pv ON si.variant_id = pv.id
                JOIN products p ON pv.product_id = p.id
                WHERE s.date >= $1 AND s.owner_id = $2
                GROUP BY p.name
                ORDER BY qty DESC
            `, [firstDay, ownerId]),
            pool.query(`
                SELECT customer as name, SUM(total_profit) as profit
                FROM sales
                WHERE owner_id = $1
                GROUP BY customer
                ORDER BY profit DESC
                LIMIT 10
            `, [ownerId]),
            pool.query(`
                SELECT name, COUNT(*) as attendance, AVG(shake_profit) as "profitPerDay", SUM(shake_profit) as "totalProfit"
                FROM attendance
                WHERE status = 'Present' AND owner_id = $1
                GROUP BY name
                ORDER BY "totalProfit" DESC
            `, [ownerId])
        ]);

        stats.totals.totalSalesProfit = res1.rows[0]?.totalProfit || 0;
        stats.totals.totalVpSold = res2.rows[0]?.totalVp || 0;

        if (res3.rows.length > 0) {
            stats.totals.totalStockValue = res3.rows[0].stockValue || 0;
            stats.totals.lowStockCount = parseInt(res3.rows[0].lowStock || 0);
        }

        stats.lowStockItems = res4.rows || [];

        stats.monthlyProductSales = res5.rows || [];
        if (stats.monthlyProductSales.length > 0) stats.totals.topSeller = stats.monthlyProductSales[0].name;

        stats.topCustomers = res6.rows || [];

        stats.shakeProfitDetails = res7.rows || [];
        stats.totals.totalShakeProfit = (stats.shakeProfitDetails).reduce((acc, curr) => acc + (parseFloat(curr.totalProfit) || 0), 0);

        res.json({ success: true, data: stats });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.resetData = async (req, res) => {
    try {
        const ownerId = getOwnerId(req);
        const { password } = req.body;
        
        const { rows } = await pool.query('SELECT role, password FROM users WHERE id = $1', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Admin user not found." });
        }
        
        const rawRole = rows[0].role;
        const currentRole = String(rawRole || '').toLowerCase().trim();
        if (currentRole !== 'admin') {
            return res.status(403).json({ success: false, message: `Permission denied. Your current role is '${rawRole}', but 'admin' is required.` });
        }
        
        const isMatch = await bcrypt.compare(password, rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Admin Password. Factory reset aborted." });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Delete top-level entities. Cascading will automatically handle stock, sale_items, product_variants.
            // We delete all entities associated with this owner.
            await client.query('DELETE FROM sale_items WHERE owner_id = $1', [ownerId]);
            await client.query('DELETE FROM sales WHERE owner_id = $1', [ownerId]);
            await client.query('DELETE FROM stock WHERE owner_id = $1', [ownerId]);
            await client.query('DELETE FROM product_variants WHERE owner_id = $1', [ownerId]);
            await client.query('DELETE FROM products WHERE owner_id = $1', [ownerId]);
            await client.query('DELETE FROM attendance WHERE owner_id = $1', [ownerId]);
            
            await client.query('COMMIT');
            res.json({ success: true, message: "All data has been permanently deleted." });
        } catch (dbError) {
            await client.query('ROLLBACK');
            console.error("Reset Data DB Error:", dbError);
            res.status(500).json({ success: false, message: "Database Error: " + dbError.message });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Reset Data Server Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

exports.exportReport = async (req, res) => {
    const type = req.query.type;
    const ownerId = getOwnerId(req);
    if (!['sales', 'attendance', 'summary'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    try {
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
        
        let filename = `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

        // Professional Header
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#222222').text('Life Care', { align: 'center' });
        doc.fontSize(14).font('Helvetica').fillColor('#555555').text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, { align: 'center' });
        doc.moveDown(2);

        // Fetch data
        const getSales = async () => {
            const { rows } = await pool.query(`SELECT s.date, s.customer, p.name as product, pv.flavor, si.qty, (pv.sp * si.qty) as amount, si.profit 
                    FROM sale_items si 
                    JOIN sales s ON si.sale_id = s.id 
                    LEFT JOIN product_variants pv ON si.variant_id = pv.id 
                    LEFT JOIN products p ON pv.product_id = p.id
                    WHERE s.owner_id = $1
                    ORDER BY s.date DESC`, [ownerId]);
            return rows;
        };

        const getAttendance = async () => {
            const { rows } = await pool.query(`SELECT date, name, status, shake_profit FROM attendance WHERE owner_id = $1 ORDER BY date DESC`, [ownerId]);
            return rows;
        };

        let sales = [];
        let attendance = [];

        if (type === 'sales' || type === 'summary') sales = await getSales();
        if (type === 'attendance' || type === 'summary') attendance = await getAttendance();

        // Group by Date
        const grouped = {};
        
        sales.forEach(s => {
            // Postgres TIMESTAMP might return Date objects, so we need to format to YYYY-MM-DD
            const dateStr = s.date instanceof Date ? s.date.toISOString().split('T')[0] : String(s.date).split('T')[0];
            if (!grouped[dateStr]) grouped[dateStr] = { sales: [], attendance: [] };
            grouped[dateStr].sales.push(s);
        });

        attendance.forEach(a => {
            const dateStr = a.date instanceof Date ? a.date.toISOString().split('T')[0] : String(a.date).split('T')[0];
            if (!grouped[dateStr]) grouped[dateStr] = { sales: [], attendance: [] };
            grouped[dateStr].attendance.push(a);
        });

        const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

        const drawTable = (title, headers, rowsData, colWidths) => {
            if (doc.y > doc.page.height - 100 && doc.y > doc.page.margins.top + 50) doc.addPage();
            
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#333333').text(title, doc.page.margins.left);
            doc.moveDown(0.5);

            // Draw Headers
            let currentX = doc.page.margins.left;
            doc.rect(currentX, doc.y, contentWidth, 22).fillAndStroke('#f8f9fa', '#e9ecef');
            
            doc.fillColor('#495057').font('Helvetica-Bold').fontSize(10);
            const headerY = doc.y + 6;
            
            headers.forEach((h, i) => {
                doc.text(h, currentX + 8, headerY, { width: colWidths[i] - 16, align: (i === headers.length - 1 || h === 'Amount' || h === 'Qty') ? 'right' : 'left' });
                currentX += colWidths[i];
            });
            
            doc.y += 22; // move past header

            // Draw Rows
            doc.font('Helvetica').fontSize(10).fillColor('#212529');
            rowsData.forEach((row, rowIndex) => {
                if (doc.y > doc.page.height - doc.page.margins.bottom - 20) {
                    doc.addPage();
                    doc.y = doc.page.margins.top;
                }
                
                const startY = doc.y;
                currentX = doc.page.margins.left;
                
                row.forEach((cell, i) => {
                    doc.text(String(cell), currentX + 8, startY + 6, { 
                        width: colWidths[i] - 16, 
                        align: (i === row.length - 1 || headers[i] === 'Amount' || headers[i] === 'Qty') ? 'right' : 'left' 
                    });
                    currentX += colWidths[i];
                });
                
                doc.y = startY + 22;
                
                doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + contentWidth, doc.y).lineWidth(0.5).stroke('#f1f3f5');
            });
            doc.moveDown(0.5);
        };

        if (dates.length === 0) {
            doc.font('Helvetica').fontSize(12).fillColor('#666666').text('No data available for this report.', { align: 'center' });
        }

        dates.forEach((date, idx) => {
            if (doc.y > doc.page.height - 180 && doc.y > doc.page.margins.top + 50) {
                doc.addPage();
            } else if (idx > 0) {
                doc.moveDown(1.5);
            }

            const dateStr = date.split('-').reverse().join('/');
            doc.rect(doc.page.margins.left, doc.y, contentWidth, 28).fill('#f1f3f5');
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#212529').text(`DATE: ${dateStr}`, doc.page.margins.left + 12, doc.y + 8);
            doc.y += 28;
            doc.moveDown(0.5);

            const data = grouped[date];

            let dailyAttendanceCount = 0;
            let dailySalesAmount = 0;
            let dailyProfit = 0;

            if (data.attendance.length > 0) {
                const attHeaders = ['Name', 'Status', 'Profit'];
                const attWidths = [contentWidth * 0.5, contentWidth * 0.3, contentWidth * 0.2];
                const attRows = data.attendance.map(a => {
                    if (a.status === 'Present') dailyAttendanceCount++;
                    dailyProfit += (parseFloat(a.shake_profit) || 0);
                    return [a.name, a.status, `Rs. ${a.shake_profit || 0}`];
                });
                drawTable('Attendance', attHeaders, attRows, attWidths);
            }

            if (data.sales.length > 0) {
                const saleHeaders = ['Customer', 'Product', 'Qty', 'Amount', 'Profit'];
                const saleWidths = [contentWidth * 0.28, contentWidth * 0.35, contentWidth * 0.1, contentWidth * 0.13, contentWidth * 0.14];
                const saleRows = data.sales.map(s => {
                    dailySalesAmount += (parseFloat(s.amount) || 0);
                    dailyProfit += (parseFloat(s.profit) || 0);
                    return [
                        s.customer, 
                        `${s.product || 'N/A'} ${s.flavor ? '('+s.flavor+')' : ''}`, 
                        s.qty, 
                        `Rs. ${s.amount || 0}`,
                        `Rs. ${s.profit || 0}`
                    ];
                });
                drawTable('Sales', saleHeaders, saleRows, saleWidths);
            }

            if (doc.y > doc.page.height - 120 && doc.y > doc.page.margins.top + 50) {
                doc.addPage();
            }
            doc.moveDown(0.5);
            
            const summaryX = doc.page.margins.left;
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#212529').text('Daily Summary', summaryX);
            doc.moveDown(0.3);
            doc.font('Helvetica').fontSize(10).fillColor('#495057');
            
            let summaryY = doc.y;
            
            if (type === 'attendance' || type === 'summary') {
                doc.text(`Total Attendance:`, summaryX, summaryY);
                doc.font('Helvetica-Bold').text(`${dailyAttendanceCount}`, summaryX + 100, summaryY);
                summaryY += 15;
            }
            if (type === 'sales' || type === 'summary') {
                doc.font('Helvetica').text(`Total Sales:`, summaryX, summaryY);
                doc.font('Helvetica-Bold').text(`Rs. ${dailySalesAmount}`, summaryX + 100, summaryY);
                summaryY += 15;
            }
            
            doc.font('Helvetica').text(`Total Profit:`, summaryX, summaryY);
            doc.font('Helvetica-Bold').fillColor('#228be6').text(`Rs. ${dailyProfit}`, summaryX + 100, summaryY);
            
            doc.y = summaryY + 20;
        });

        let pages = doc.bufferedPageRange ? doc.bufferedPageRange().count : 1;
        
        const generatedDate = new Date();
        const fDate = generatedDate.toLocaleDateString('en-GB');
        const fTime = generatedDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        for (let i = 0; i < pages; i++) {
            if (doc.switchToPage) doc.switchToPage(i);
            doc.moveTo(doc.page.margins.left, doc.page.height - 50).lineTo(doc.page.width - doc.page.margins.right, doc.page.height - 50).lineWidth(0.5).stroke('#dee2e6');
            doc.fontSize(8).fillColor('#868e96').text('Generated by Nutrition Club Manager', doc.page.margins.left, doc.page.height - 40, { align: 'left' });
            doc.text(`Generated on: ${fDate} ${fTime}`, doc.page.margins.left, doc.page.height - 40, { align: 'right' });
        }
        
        doc.end();
    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.clearAttendanceData = async (req, res) => {
    const { month } = req.body;
    const ownerId = getOwnerId(req);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        let query = 'DELETE FROM attendance WHERE owner_id = $1';
        let params = [ownerId];
        
        if (month) {
            query += " AND TO_CHAR(date, 'YYYY-MM') = $2";
            params.push(month);
        }
        
        await client.query(query, params);
        await client.query('COMMIT');
        
        res.json({ success: true, message: `Attendance data cleared successfully${month ? ` for ${month}` : ''}.` });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Clear Attendance Error:", error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

exports.clearSalesData = async (req, res) => {
    const { month } = req.body;
    const ownerId = getOwnerId(req);
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        let saleQuery = 'DELETE FROM sales WHERE owner_id = $1';
        let saleParams = [ownerId];
        
        let itemQuery = 'DELETE FROM sale_items WHERE owner_id = $1';
        let itemParams = [ownerId];
        
        if (month) {
            saleQuery += " AND TO_CHAR(date, 'YYYY-MM') = $2";
            saleParams.push(month);
            
            itemQuery = "DELETE FROM sale_items WHERE owner_id = $1 AND sale_id IN (SELECT id FROM sales WHERE TO_CHAR(date, 'YYYY-MM') = $2 AND owner_id = $3)";
            itemParams = [ownerId, month, ownerId];
        }
        
        await client.query(itemQuery, itemParams);
        await client.query(saleQuery, saleParams);
        
        await client.query('COMMIT');
        res.json({ success: true, message: `Sales data cleared successfully${month ? ` for ${month}` : ''}.` });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Clear Sales Error:", error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};
