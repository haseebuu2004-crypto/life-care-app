const pool = require('./backend/shared/db/connection');
const queries = require('./backend/features/backup/backup.queries');

async function test() {
    try {
        console.log("Testing customers...");
        await pool.query(queries.getExportCustomers('test').text, queries.getExportCustomers('test').values);
        console.log("Testing attendance...");
        await pool.query(queries.getExportAttendance('test').text, queries.getExportAttendance('test').values);
        console.log("Testing sales...");
        await pool.query(queries.getExportSales('test').text, queries.getExportSales('test').values);
        console.log("Testing sale_items...");
        await pool.query(queries.getExportSaleItems('test').text, queries.getExportSaleItems('test').values);
        console.log("Testing products...");
        await pool.query(queries.getExportProducts('test').text, queries.getExportProducts('test').values);
        console.log("Testing product_versions...");
        await pool.query(queries.getExportProductVersions('test').text, queries.getExportProductVersions('test').values);
        console.log("Testing flavours...");
        await pool.query(queries.getExportFlavours('test').text, queries.getExportFlavours('test').values);
        console.log("Testing stock...");
        await pool.query(queries.getExportStock('test').text, queries.getExportStock('test').values);
        console.log("All OK");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
test();
