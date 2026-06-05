const oldController = require('./backend/controllers/customerController');
const newController = require('./backend/features/customers/customers.controller');
require('dotenv').config({ path: './backend/.env' });

async function verifyContracts() {
    console.log("=== CONTRACT COMPARISON ===");

    const reqMock = {
        user: { id: 1, email: 'hasieeyy4444@gmail.com', role: 'admin', owner_id: 'test_owner' },
        params: { id: 9999 },
        body: { name: 'Test' }
    };

    let oldStatus, oldJson;
    const resOld = {
        status: (code) => { oldStatus = code; return resOld; },
        json: (data) => { oldJson = data; }
    };

    let newStatus, newJson;
    const resNew = {
        status: (code) => { newStatus = code; return resNew; },
        json: (data) => { newJson = data; }
    };

    try {
        // Test 1: getCustomers
        oldStatus = 200; newStatus = 200;
        await oldController.getCustomers(reqMock, resOld);
        await newController.getCustomers(reqMock, resNew);
        console.log(`getCustomers - Old: ${oldStatus}, New: ${newStatus}`);
        console.log(JSON.stringify(oldJson) === JSON.stringify(newJson) ? "GET Match!" : "Mismatch!");

        // Test 2: getCustomerSummary (404 test)
        oldStatus = 200; newStatus = 200;
        await oldController.getCustomerSummary(reqMock, resOld);
        await newController.getCustomerSummary(reqMock, resNew);
        console.log(`getCustomerSummary - Old: ${oldStatus}, New: ${newStatus}`);
        console.log(JSON.stringify(oldJson) === JSON.stringify(newJson) ? "SUMMARY Match!" : "Mismatch!");
        
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

verifyContracts();
