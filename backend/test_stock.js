const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: '.env'});

function request(path, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null }); } 
                catch (e) { resolve({ status: res.statusCode, data: body }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function testStock() {
    const SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
    const email = 'realuser@gmail.com';
    const pendingToken = jwt.sign(
        { id: 99, username: 'realuser', email: email, role: 'pending', owner_id: email },
        SECRET, { expiresIn: '15m' }
    );

    // 1. Verify password to get final token
    await request('/api/auth/select-role', 'POST', { selectedRole: 'admin' }, pendingToken);
    
    console.log("Creating admin password...");
    await request('/api/auth/set-password', 'POST', { selectedRole: 'admin', password: 'Password123' }, pendingToken);
    
    let loginRes = await request('/api/auth/verify-password', 'POST', { selectedRole: 'admin', password: 'Password123' }, pendingToken);
    console.log("Verify Res:", loginRes.data);
    const finalToken = loginRes.data?.token;
    console.log("Logged in. Token:", finalToken ? "YES" : "NO");

    // 2. Add Stock
    console.log("Adding stock...");
    let addRes = await request('/api/stock', 'POST', { productName: 'My Test Shake', quantity: 10 }, finalToken);
    console.log("Add Stock:", addRes.data);

    // 3. Fetch Stock
    let getRes = await request('/api/stock', 'GET', null, finalToken);
    console.log("Stock Count:", getRes.data?.data?.length);

    // 4. Simulate Logout/Login
    console.log("\nSimulating Logout & Login...");
    let loginRes2 = await request('/api/auth/verify-password', 'POST', { selectedRole: 'admin', password: 'Password123' }, pendingToken);
    const finalToken2 = loginRes2.data.token;
    
    let getRes2 = await request('/api/stock', 'GET', null, finalToken2);
    console.log("Stock Count After Login:", getRes2.data?.data?.length);
}

testStock();
