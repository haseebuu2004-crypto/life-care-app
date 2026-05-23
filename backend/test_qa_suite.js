const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: '.env'});

const SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
// Simulate Google Sign-in temporary token
const tempToken = jwt.sign(
    { id: 1, username: 'admin', email: 'haseebuu2004@gmail.com', role: 'pending', owner_id: 'haseebuu2004@gmail.com' },
    SECRET,
    { expiresIn: '15m' }
);

function request(path, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTests() {
    console.log("=========================================");
    console.log("PHASE 2 & 3: ROLE SELECTION AND PASSWORD");
    console.log("=========================================");
    
    // Test role selection with incorrect password
    let invalidRes = await request('/api/auth/select-role', 'POST', { selectedRole: 'admin', password: 'wrong' }, tempToken);
    console.log("Admin invalid password:", invalidRes.status === 401 ? "Passed (Blocked 401)" : `Failed (${invalidRes.status})`);

    // Test role selection with correct password
    let res = await request('/api/auth/select-role', 'POST', { selectedRole: 'admin', password: 'Admin-eeb8b778' }, tempToken);
    console.log("Admin valid password:", res.status === 200 ? "Passed" : `Failed (${res.status})`);
    
    if (!res.data || !res.data.token) {
        console.error("FAIL: Could not login. Response:", res.data);
        return;
    }
    const finalToken = res.data.token;
    console.log("Successfully retrieved verified JWT:", finalToken.substring(0, 20) + "...");

    console.log("\n=========================================");
    console.log("PHASE 5-6: STOCK AND SALES WORKFLOW");
    console.log("=========================================");
    
    const productName = `QA Test Product ${Date.now()}`;
    let stockRes = await request('/api/stock', 'POST', {
        productName: productName, hasFlavours: false, price: 1000, volumePoint: 10, quantity: 50
    }, finalToken);
    console.log("Add Stock:", stockRes.status === 200 || stockRes.status === 201 ? "Passed" : "Failed", stockRes.data.message || stockRes.data);
    
    const stockList = await request('/api/stock', 'GET', null, finalToken);
    const stockArray = stockList.data.data || stockList.data;
    const productId = stockArray.find(s => s.product_name === productName)?.id;

    let dashRes1 = await request('/api/dashboard/stats', 'GET', null, finalToken);
    const initialSales = dashRes1.data.totalSalesProfit;

    let saleRes = await request('/api/sales', 'POST', {
        stockId: productId, quantity: 5, sellingPrice: 1500, profit: 0
    }, finalToken);
    console.log("Execute Sale (5 items, 2500 total profit):", saleRes.status === 201 ? "Passed" : "Failed");

    let dashRes2 = await request('/api/dashboard/stats', 'GET', null, finalToken);
    console.log("Dashboard update (Profit matched?):", dashRes2.data.totalSalesProfit === initialSales + 2500 ? "Passed" : `Failed (Got ${dashRes2.data.totalSalesProfit}, Expected ${initialSales + 2500})`);
    
    let overSaleRes = await request('/api/sales', 'POST', {
        stockId: productId, quantity: 100, sellingPrice: 1500, profit: 0
    }, finalToken);
    console.log("Negative Stock Prevention:", overSaleRes.status === 400 ? "Passed (Blocked 400)" : "Failed");

    console.log("\n=========================================");
    console.log("PHASE 7: ATTENDANCE WORKFLOW");
    console.log("=========================================");
    const today = new Date().toISOString().split('T')[0];
    let attRes = await request('/api/attendance', 'POST', { date: today, status: 'present', member_id: 1 }, finalToken);
    console.log("Mark Attendance:", attRes.status === 201 ? "Passed" : (attRes.status === 400 ? "Duplicate Handled" : "Failed"));

    console.log("\n=========================================");
    console.log("PHASE 9: CONCURRENCY TESTING");
    console.log("=========================================");
    let promises = [];
    for(let i = 0; i < 10; i++) {
        promises.push(request('/api/sales', 'POST', { stockId: productId, quantity: 1, sellingPrice: 1500, profit: 0 }, finalToken));
    }
    let results = await Promise.all(promises);
    console.log(`Executed 10 concurrent sales. Successes: ${results.filter(r => r.status === 201).length}`);
    
    let finalStock = await request('/api/stock', 'GET', null, finalToken);
    let p = (finalStock.data.data || finalStock.data).find(s => s.id === productId);
    console.log(`Final stock for QA Test Product: ${p.quantity} (Expected 35)`);
    console.log("Concurrency Test:", p.quantity === 35 ? "Passed" : "Failed");
}

runTests();
