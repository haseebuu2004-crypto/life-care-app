const db = require('../shared/db/connection');
const queries = require('../features/dashboard/dashboard.queries');

async function testStats() {
    try {
        const ownerId = 'd89c952c-239c-4d3e-b03c-907bafd71828'; // Will just pick an arbitrary one or just 1
        console.log("Connecting...");
        const client = await db.pool.connect();
        
        // Find an owner
        const userRes = await client.query('SELECT id FROM users LIMIT 1');
        const realOwnerId = userRes.rows[0].id;
        console.log('Testing with ownerId:', realOwnerId);

        console.log("1. Admin Config");
        const q1 = queries.getAdminConfig(realOwnerId);
        await client.query(q1.text, q1.values);
        
        console.log("2. PIT Scalars");
        const q2 = queries.getDashboardPitScalars(realOwnerId);
        await client.query(q2.text, q2.values);

        console.log("3. Low Stock Items");
        const q3 = queries.getLowStockItems(realOwnerId);
        await client.query(q3.text, q3.values);

        console.log("4. Period Scalars");
        const q4 = queries.getDashboardPeriodScalars(realOwnerId, '2020-01-01', '2030-01-01');
        await client.query(q4.text, q4.values);

        console.log("5. Monthly Product Sales");
        const q5 = queries.getMonthlyProductSales(realOwnerId, '2020-01-01', '2030-01-01');
        await client.query(q5.text, q5.values);

        console.log("6. Top Customers");
        const q6 = queries.getTopCustomers(realOwnerId, '2020-01-01', '2030-01-01');
        await client.query(q6.text, q6.values);

        console.log("7. Shake Profit Details");
        const q7 = queries.getShakeProfitDetails(realOwnerId, '2020-01-01', '2030-01-01');
        await client.query(q7.text, q7.values);

        console.log("All queries executed successfully.");
        client.release();
    } catch(err) {
        console.error("Test failed:", err);
    }
    process.exit();
}

testStats();
