const ExcelJS = require('exceljs');
const db = require('../../shared/db/connection');
const queries = require('./reports.queries');

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

        const PDFDocument = require('pdfkit-table');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));

        let titlePrefix = '';
        if (data && data.range === 'weekly') titlePrefix = 'WEEKLY ';
        else if (data && data.range === 'monthly') titlePrefix = 'MONTHLY ';
        else titlePrefix = 'ALL-TIME ';

        // Header
        doc.font('Helvetica-Bold').fontSize(24).fillColor('#0f172a').text(`${clubName || 'BUSINESS'} REPORT`, { align: 'center' });
        doc.font('Helvetica').fontSize(16).fillColor('#475569').text(`${titlePrefix}${type.toUpperCase()}`, { align: 'center' }).moveDown(0.5);
        doc.fontSize(12).fillColor('#64748b').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' }).moveDown(2);

        if (type === 'sales') {
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#64748b').text('TOTAL REVENUE', { align: 'left' });
            doc.font('Helvetica-Bold').fontSize(24).fillColor('#0f172a').text(`Rs. ${(data.total || 0).toFixed(2)}`, { align: 'left' }).moveDown(2);

            const table = {
                headers: ["Date", "Customer", "Product", "Quantity", "Amount", "Profit"],
                rows: (data.rows || []).map(r => [
                    r.sale_date ? new Date(r.sale_date).toLocaleDateString('en-CA') : 'N/A',
                    r.customer || 'Unknown',
                    r.product || 'Unknown',
                    (r.quantity || 0).toString(),
                    `Rs. ${((r.price_charged * r.quantity) / 100).toFixed(2)}`,
                    `Rs. ${((r.item_profit || 0) / 100).toFixed(2)}`
                ])
            };
            if (table.rows.length > 0) {
                await doc.table(table, { prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10), prepareRow: () => doc.font('Helvetica').fontSize(10) });
            } else {
                doc.font('Helvetica').fontSize(12).text('No records found.');
            }
        } else if (type === 'attendance') {
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#64748b').text('TOTAL SHAKE PROFIT', { align: 'left' });
            doc.font('Helvetica-Bold').fontSize(24).fillColor('#0f172a').text(`Rs. ${(data.profit || 0).toFixed(2)}`, { align: 'left' }).moveDown(2);

            const table = {
                headers: ["Date", "Customer", "Type", "Profit"],
                rows: (data.rows || []).map(r => [
                    r.attendance_date ? new Date(r.attendance_date).toLocaleDateString('en-CA') : 'N/A',
                    r.name || 'Unknown',
                    r.type || 'N/A',
                    `Rs. ${((r.shake_amount || 0) / 100).toFixed(2)}`
                ])
            };
            if (table.rows.length > 0) {
                await doc.table(table, { prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10), prepareRow: () => doc.font('Helvetica').fontSize(10) });
            } else {
                doc.font('Helvetica').fontSize(12).text('No records found.');
            }
        } else if (type === 'summary') {
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#64748b').text('TOTAL SALES REVENUE');
            doc.font('Helvetica-Bold').fontSize(20).fillColor('#0f172a').text(`Rs. ${((data.sales?.rev || 0) / 100).toFixed(2)}`).moveDown(1);
            
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#64748b').text('TOTAL SALES PROFIT');
            doc.font('Helvetica-Bold').fontSize(20).fillColor('#10b981').text(`Rs. ${((data.sales?.prof || 0) / 100).toFixed(2)}`).moveDown(1);

            doc.font('Helvetica-Bold').fontSize(12).fillColor('#64748b').text('TOTAL ATTENDANCE PROFIT');
            doc.font('Helvetica-Bold').fontSize(20).fillColor('#8b5cf6').text(`Rs. ${((data.attendance?.att_prof || 0) / 100).toFixed(2)}`).moveDown(1);

            doc.font('Helvetica-Bold').fontSize(12).fillColor('#64748b').text('TOTAL ACTIVE CUSTOMERS');
            doc.font('Helvetica-Bold').fontSize(20).fillColor('#f59e0b').text(`${data.customers?.count || 0}`).moveDown(2);

            if (data.salesList && data.salesList.length > 0) {
                doc.font('Helvetica-Bold').fontSize(16).fillColor('#0f172a').text('Sales Records').moveDown(1);
                const table = {
                    headers: ["Date", "Customer", "Product", "Quantity", "Amount", "Profit"],
                    rows: data.salesList.map(r => [
                        r.sale_date ? new Date(r.sale_date).toLocaleDateString('en-CA') : 'N/A',
                        r.customer || 'Unknown',
                        r.product || 'Unknown',
                        (r.quantity || 0).toString(),
                        `Rs. ${((r.price_charged * r.quantity) / 100).toFixed(2)}`,
                        `Rs. ${((r.item_profit || 0) / 100).toFixed(2)}`
                    ])
                };
                await doc.table(table, { prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10), prepareRow: () => doc.font('Helvetica').fontSize(10) });
                doc.moveDown(2);
            }

            if (data.attendanceList && data.attendanceList.length > 0) {
                doc.font('Helvetica-Bold').fontSize(16).fillColor('#0f172a').text('Attendance Records').moveDown(1);
                const table = {
                    headers: ["Date", "Customer", "Type", "Profit"],
                    rows: data.attendanceList.map(r => [
                        r.attendance_date ? new Date(r.attendance_date).toLocaleDateString('en-CA') : 'N/A',
                        r.name || 'Unknown',
                        r.type || 'N/A',
                        `Rs. ${((r.shake_amount || 0) / 100).toFixed(2)}`
                    ])
                };
                await doc.table(table, { prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10), prepareRow: () => doc.font('Helvetica').fontSize(10) });
            }
        }

        doc.end();
        const pdfBuffer = await new Promise(resolve => {
            doc.on('end', () => resolve(Buffer.concat(buffers)));
        });

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
            const prodQueries = require('../products/products.queries');
            
            const nameAliases = ['name', 'product name', 'item name', 'product', 'item'];
            const priceAliases = ['vendor_price', 'price', 'cost', 'vendor price', 'amount', 'unit price'];
            const vpAliases = ['volume_points', 'vp', 'volume points', 'points'];
            const flavorAliases = ['flavor', 'flavors', 'flavour', 'flavours', 'variant', 'variants', 'types'];

            const cleanHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z_]/g, ' ').trim());
            
            const nameIdx = cleanHeaders.findIndex(h => nameAliases.includes(h) || nameAliases.includes(h.replace(/ /g, '_')));
            const vpIdx = cleanHeaders.findIndex(h => priceAliases.includes(h) || priceAliases.includes(h.replace(/ /g, '_')));
            const volPtsIdx = cleanHeaders.findIndex(h => vpAliases.includes(h) || vpAliases.includes(h.replace(/ /g, '_')));
            const flavorIdx = cleanHeaders.findIndex(h => flavorAliases.includes(h) || flavorAliases.includes(h.replace(/ /g, '_')));

            if (nameIdx === -1 || vpIdx === -1) {
                throw new Error("CSV must contain columns for Product Name and Price.");
            }

            for (let i = 1; i < lines.length; i++) {
                // Split by comma, ignoring commas inside double quotes
                const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim());
                if (!cols[nameIdx]) continue;

                const name = cols[nameIdx].replace(/^"|"$/g, '').trim();
                if (name === '') continue;

                const vendorPriceRaw = cols[vpIdx].replace(/[^0-9.]/g, '');
                const vp = Math.round(Number(vendorPriceRaw || 0) * 100);
                
                const volumePointsRaw = volPtsIdx !== -1 ? cols[volPtsIdx].replace(/[^0-9.]/g, '') : '0';
                const volumePoints = parseFloat(volumePointsRaw) || 0;
                
                const flavorStr = flavorIdx !== -1 ? cols[flavorIdx].replace(/^"|"$/g, '').trim() : '';

                const prodRes = await prodQueries.insertProduct(client, ownerId, name);
                const productId = prodRes.rows[0].id;

                const pvRes = await prodQueries.insertProductVersion(client, productId, vp, volumePoints, userId, '1');
                const versionId = pvRes.rows[0].id;

                if (flavorStr && flavorStr !== '') {
                    // Flavors might be separated by commas, semicolons, or pipes
                    const flavorsList = flavorStr.split(/[;,|]/).map(f => f.trim()).filter(f => f !== '');
                    const uniqueFlavorsMap = new Map();
                    for (const f of flavorsList) {
                        uniqueFlavorsMap.set(f.toLowerCase(), f);
                    }
                    if (uniqueFlavorsMap.size === 0) {
                        await prodQueries.insertVariant(client, versionId, ownerId, 'Standard');
                    } else {
                        for (const cleanFlavour of uniqueFlavorsMap.values()) {
                            await prodQueries.insertVariant(client, versionId, ownerId, cleanFlavour);
                        }
                    }
                } else {
                    await prodQueries.insertVariant(client, versionId, ownerId, 'Standard');
                }

                await client.query(`
                    UPDATE variants v
                    SET sku = UPPER(SUBSTRING(p.name FROM 1 FOR 3)) || '-' || UPPER(SUBSTRING(v.name FROM 1 FOR 4)) || '-' || UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 4))
                    FROM product_versions pv
                    JOIN products p ON p.id = pv.product_id
                    WHERE v.product_version_id = pv.id 
                      AND pv.id = $1 
                      AND (v.sku IS NULL OR v.sku = '')
                `, [versionId]);
                
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
