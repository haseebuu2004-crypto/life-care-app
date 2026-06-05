const pool = require('../../shared/db/connection');
const xlsx = require('xlsx');
const { createObjectCsvStringifier } = require('csv-writer');
const queries = require('./backup.queries');

class BackupService {
    async getExportData(type, ownerId) {
        if (!ownerId) throw new Error("Owner ID is required for backup.");
        
        const data = {};

        switch (type.toLowerCase()) {
            case 'customers':
                data.customers = (await pool.query(queries.getExportCustomers(ownerId).text, queries.getExportCustomers(ownerId).values)).rows;
                break;
            case 'attendance':
                data.attendance = (await pool.query(queries.getExportAttendance(ownerId).text, queries.getExportAttendance(ownerId).values)).rows;
                break;
            case 'sales':
                data.sales = (await pool.query(queries.getExportSales(ownerId).text, queries.getExportSales(ownerId).values)).rows;
                data.sale_items = (await pool.query(queries.getExportSaleItems(ownerId).text, queries.getExportSaleItems(ownerId).values)).rows;
                break;
            case 'products':
                data.products = (await pool.query(queries.getExportProducts(ownerId).text, queries.getExportProducts(ownerId).values)).rows;
                data.product_versions = (await pool.query(queries.getExportProductVersions(ownerId).text, queries.getExportProductVersions(ownerId).values)).rows;
                data.flavours = (await pool.query(queries.getExportFlavours(ownerId).text, queries.getExportFlavours(ownerId).values)).rows;
                data.stock = (await pool.query(queries.getExportStock(ownerId).text, queries.getExportStock(ownerId).values)).rows;
                break;
            case 'full':
                data.customers = (await pool.query(queries.getExportCustomers(ownerId).text, queries.getExportCustomers(ownerId).values)).rows;
                data.attendance = (await pool.query(queries.getExportAttendance(ownerId).text, queries.getExportAttendance(ownerId).values)).rows;
                data.sales = (await pool.query(queries.getExportSales(ownerId).text, queries.getExportSales(ownerId).values)).rows;
                data.sale_items = (await pool.query(queries.getExportSaleItems(ownerId).text, queries.getExportSaleItems(ownerId).values)).rows;
                data.products = (await pool.query(queries.getExportProducts(ownerId).text, queries.getExportProducts(ownerId).values)).rows;
                data.product_versions = (await pool.query(queries.getExportProductVersions(ownerId).text, queries.getExportProductVersions(ownerId).values)).rows;
                data.flavours = (await pool.query(queries.getExportFlavours(ownerId).text, queries.getExportFlavours(ownerId).values)).rows;
                data.stock = (await pool.query(queries.getExportStock(ownerId).text, queries.getExportStock(ownerId).values)).rows;
                break;
            default:
                throw new Error('Invalid backup type');
        }

        return data;
    }

    async generateExcel(data, type, ownerId) {
        const workbook = xlsx.utils.book_new();
        const exportedAt = new Date().toISOString();

        for (const [sheetName, rows] of Object.entries(data)) {
            // Prepend Metadata row
            const metadataRow = { 
                id: `type=${type}`, 
                owner_id: `owner_id=${ownerId}`, 
                name: `version=1.0`, 
                created_at: `exported_at=${exportedAt}` 
            };
            // To ensure keys match the first real row, we dynamically assign metadata values to the keys of the dataset.
            // But if dataset is empty, we still need to provide metadata.
            let headers = Object.keys(rows.length > 0 ? rows[0] : metadataRow);
            
            const meta = {};
            meta[headers[0] || 'id'] = `type=${type}`;
            meta[headers[1] || 'owner_id'] = `owner_id=${ownerId}`;
            meta[headers[2] || 'name'] = `version=1.0`;
            meta[headers[3] || 'created_at'] = `exported_at=${exportedAt}`;

            const combinedData = [meta, ...rows];
            const sheet = xlsx.utils.json_to_sheet(combinedData);

            // Hide metadata row (row index 1 in Excel, beneath headers)
            if (!sheet['!rows']) sheet['!rows'] = [];
            sheet['!rows'][1] = { hidden: true, hpx: 0 };

            xlsx.utils.book_append_sheet(workbook, sheet, sheetName);
        }

        return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    async generateCSV(data, type, ownerId) {
        const keys = Object.keys(data);
        if (keys.length > 1) {
            throw new Error('CSV format does not support multi-sheet exports. Please use Excel.');
        }

        const sheetName = keys[0];
        const rows = data[sheetName] || [];
        
        const exportedAt = new Date().toISOString();
        const meta = { 
            col1: `type=${type}`, 
            col2: `owner_id=${ownerId}`, 
            col3: `version=1.0`, 
            col4: `exported_at=${exportedAt}` 
        };

        if (rows.length === 0) {
            return `type=${type},owner_id=${ownerId},version=1.0,exported_at=${exportedAt}\n`;
        }

        const headers = Object.keys(rows[0]).map(key => ({ id: key, title: key }));
        const csvStringifier = createObjectCsvStringifier({ header: headers });
        
        let metaRowData = {};
        const headerKeys = Object.keys(rows[0]);
        metaRowData[headerKeys[0]] = meta.col1;
        metaRowData[headerKeys[1]] = meta.col2;
        metaRowData[headerKeys[2]] = meta.col3;
        metaRowData[headerKeys[3]] = meta.col4;

        const headerRow = csvStringifier.getHeaderString();
        const bodyRows = csvStringifier.stringifyRecords([metaRowData, ...rows]);
        
        return headerRow + bodyRows;
    }

    generateFileName(type, format, clubName = '') {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '_');
        const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
        
        let prefix = 'backup';
        if (clubName) {
            const slug = clubName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            prefix = `${slug}_backup`;
        }
        
        return `${prefix}_${type.toLowerCase()}_${dateStr}_${timeStr}.${format}`;
    }
}

module.exports = new BackupService();
