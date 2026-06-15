require('dotenv').config({ path: './backend/.env' });
const db = require('./backend/shared/db/connection');
const reportsService = require('./backend/features/reports/reports.service');

(async () => {
    try {
        const adminConfigRes = await db.query("SELECT id, owner_id FROM users WHERE role='admin' LIMIT 1");
        const userId = adminConfigRes.rows[0].id;
        const ownerId = adminConfigRes.rows[0].owner_id || userId;

        const csvContent = "name,price\nProduct 1,150.50\nProduct 2,200";
        const buffer = Buffer.from(csvContent, 'utf8');

        const result = await reportsService.importCSV(ownerId, userId, 'products', buffer);
        console.log("Success:", result);
        process.exit(0);
    } catch(e) {
        console.error("Error:", e);
        process.exit(1);
    }
})();
