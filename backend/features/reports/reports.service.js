const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const db = require('../../shared/db/connection');
const queries = require('./reports.queries');
const { generateReportHTML } = require('./reports.template');

exports.generateReportData = async (ownerId, type, range) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
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
            const q = queries.getPDFSales(ownerId, dateFilterSales);
            const result = await db.query(q.text, q.values);

            let total = 0;
            if (result && result.rows) {
                result.rows.forEach(r => {
                    total += (r.price_charged * r.quantity) / 100;
                });
                data = { ...data, rows: result.rows, total };
            } else {
                data = { ...data, rows: [], total: 0 };
            }
        } 
        else if (type === 'attendance') {
            const q = queries.getPDFAttendance(ownerId, dateFilterAttendance);
            const result = await db.query(q.text, q.values);

            let profit = 0;
            if (result && result.rows) {
                result.rows.forEach(r => {
                    profit += r.shake_amount / 100;
                });
                data = { ...data, rows: result.rows, profit };
            } else {
                data = { ...data, rows: [], profit: 0 };
            }
        }
        else if (type === 'summary') {
            const sStatsQ = queries.getPDFSummarySalesStats(ownerId, dateFilterSales);
            const aStatsQ = queries.getPDFSummaryAttendanceStats(ownerId, dateFilterAttendance);
            const cCountQ = queries.getPDFSummaryCustomerCount(ownerId);
            
            const salesRes = await db.query(sStatsQ.text, sStatsQ.values);
            const attRes = await db.query(aStatsQ.text, aStatsQ.values);
            const custRes = await db.query(cCountQ.text, cCountQ.values);
            
            const sListQ = queries.getPDFSales(ownerId, dateFilterSales);
            const aListQ = queries.getPDFAttendance(ownerId, dateFilterAttendance);
            
            const salesList = await db.query(sListQ.text, sListQ.values);
            const attendanceList = await db.query(aListQ.text, aListQ.values);

            data = {
                ...data,
                sales: (salesRes && salesRes.rows && salesRes.rows.length > 0) ? salesRes.rows[0] : null,
                attendance: (attRes && attRes.rows && attRes.rows.length > 0) ? attRes.rows[0] : null,
                customers: (custRes && custRes.rows && custRes.rows.length > 0) ? custRes.rows[0] : null,
                salesList: (salesList && salesList.rows) ? salesList.rows : [],
                attendanceList: (attendanceList && attendanceList.rows) ? attendanceList.rows : []
            };
        }
        
        return data;
    } catch (error) {
        console.error('[ReportsService] generateReportData error:', error);
        throw error;
    }
};

exports.exportPDF = async (ownerId, type, range) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        const data = await exports.generateReportData(ownerId, type, range);
        
        const confQ = queries.getClubName(ownerId);
        const adminConfigRes = await db.query(confQ.text, confQ.values);
        const clubName = (adminConfigRes && adminConfigRes.rows && adminConfigRes.rows.length > 0) ? adminConfigRes.rows[0].club_name : '';

        const html = generateReportHTML(type, data, clubName);

        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--no-zygote'
            ]
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
        const filename = `${slug}${type}_report_${new Date().toLocaleDateString('en-CA')}.pdf`;
        
        return { buffer: pdfBuffer, filename, contentType: 'application/pdf' };
    } catch (error) {
        console.error('[ReportsService] exportPDF error:', error);
        throw error;
    }
};

exports.exportExcel = async (ownerId) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        const confQ = queries.getClubName(ownerId);
        const adminConfigRes = await db.query(confQ.text, confQ.values);
        const clubName = (adminConfigRes && adminConfigRes.rows && adminConfigRes.rows.length > 0) ? adminConfigRes.rows[0].club_name : '';
        
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
        const custQ = queries.getExcelCustomers(ownerId);
        const customers = await db.query(custQ.text, custQ.values);
        if (customers && customers.rows) {
            custSheet.addRows(customers.rows);
        }

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
        const salesQ = queries.getExcelSales(ownerId);
        const sales = await db.query(salesQ.text, salesQ.values);
        if (sales && sales.rows) {
            saleSheet.addRows(sales.rows);
        }

        const buffer = await workbook.xlsx.writeBuffer();
        
        const slug = clubName ? `${clubName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_` : '';
        const filename = `${slug}backup_${new Date().toLocaleDateString('en-CA')}.xlsx`;

        return { 
            buffer, 
            filename, 
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        };
    } catch (error) {
        console.error('[ReportsService] exportExcel error:', error);
        throw error;
    }
};

exports.importCSV = async (ownerId, userId, type, fileBuffer) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    const csvString = fileBuffer.toString('utf8');
    const lines = csvString.split('\n').map(l => l.trim()).filter(l => l);
    
    if (lines.length <= 1) throw new Error("Empty CSV or only headers found.");

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        let importedCount = 0;
        let missingIdCount = 0;

        if (type === 'customers') {
            const idIdx = headers.indexOf('id');
            const nameIdx = headers.indexOf('name');
            const phoneIdx = headers.indexOf('phone');
            
            if (nameIdx === -1) throw new Error("CSV must contain a 'name' column");

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim());
                if (!cols[nameIdx]) continue;

                const name = cols[nameIdx];
                const phone = phoneIdx !== -1 ? cols[phoneIdx] : null;
                const id = idIdx !== -1 ? cols[idIdx] : null;

                if (id) {
                    const chkQ = queries.getExistingCustomerById(id, ownerId);
                    const existing = await client.query(chkQ.text, chkQ.values);
                    if (existing.rows.length > 0) {
                        const updQ = queries.updateCustomerById(name, phone, id);
                        await client.query(updQ.text, updQ.values);
                    } else {
                        const insQ = queries.insertCustomerWithId(id, ownerId, name, phone);
                        await client.query(insQ.text, insQ.values);
                    }
                } else {
                    missingIdCount++;
                    const insNoIdQ = queries.insertCustomerWithoutId(ownerId, name, phone);
                    await client.query(insNoIdQ.text, insNoIdQ.values);
                }
                importedCount++;
            }
        } else if (type === 'products') {
            const nameIdx = headers.indexOf('name');
            const vpIdx = headers.indexOf('vendor_price');
            const qtyIdx = headers.indexOf('stock_quantity');
            
            if (nameIdx === -1 || vpIdx === -1) {
                throw new Error("CSV must contain 'name' and 'vendor_price' columns");
            }

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim());
                if (!cols[nameIdx]) continue;

                const name = cols[nameIdx];
                const vp = Math.round(Number(cols[vpIdx]) * 100);
                const qty = qtyIdx !== -1 ? parseInt(cols[qtyIdx]) || 0 : 0;

                const prodQ = queries.insertProduct(ownerId, name);
                const prodRes = await client.query(prodQ.text, prodQ.values);
                const productId = prodRes.rows[0].id;

                const verQ = queries.insertProductVersion(productId, vp, userId);
                const pvRes = await client.query(verQ.text, verQ.values);
                const versionId = pvRes.rows[0].id;

                const variantQ = queries.insertVariant(productId, ownerId, 'Standard');
                const variantRes = await client.query(variantQ.text, variantQ.values);
                const variantId = variantRes.rows[0].id;

                const stockQ = queries.insertInitialStock(versionId, variantId, ownerId, qty, vp, userId);
                await client.query(stockQ.text, stockQ.values);
                
                importedCount++;
            }
        }

        await client.query('COMMIT');
        
        return { importedCount, missingIdCount };
    } catch (e) {
        if (client) await client.query('ROLLBACK');
        console.error('[ReportsService] importCSV error:', e);
        throw e;
    } finally {
        if (client) client.release();
    }
};
