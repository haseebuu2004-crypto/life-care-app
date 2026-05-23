const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: '.env'});

const SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const tempToken = jwt.sign(
    { id: 1, username: 'mockuser', email: 'mockuser@example.com', role: 'pending', owner_id: 'mockuser@example.com' },
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
            headers: { 'Content-Type': 'application/json' }
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
    console.log("AUTH ARCHITECTURE UPGRADE TEST");
    console.log("=========================================");

    console.log("1. SELECT ROLE (Admin)");
    let selectRes = await request('/api/auth/select-role', 'POST', { selectedRole: 'admin' }, tempToken);
    console.log(`Select Role Response: ${selectRes.status}`, selectRes.data);
    
    let isPasswordSet = selectRes.data?.hasPassword;

    if (!isPasswordSet) {
        console.log("\n2. SET PASSWORD (AdminPassword1)");
        let setRes = await request('/api/auth/set-password', 'POST', { selectedRole: 'admin', password: 'AdminPassword1' }, tempToken);
        console.log(`Set Password Response: ${setRes.status}`, setRes.data?.message || 'Success');
        if (setRes.status !== 200) return;
    } else {
        console.log("\n2. SET PASSWORD (Already Set, skipping...)");
    }

    console.log("\n3. VERIFY PASSWORD (Wrong)");
    let verifyWrong = await request('/api/auth/verify-password', 'POST', { selectedRole: 'admin', password: 'WrongPassword' }, tempToken);
    console.log(`Verify Wrong: ${verifyWrong.status}`, verifyWrong.data);

    console.log("\n4. VERIFY PASSWORD (Correct)");
    let verifyCorrect = await request('/api/auth/verify-password', 'POST', { selectedRole: 'admin', password: 'AdminPassword1' }, tempToken);
    console.log(`Verify Correct: ${verifyCorrect.status}`, verifyCorrect.data?.token ? 'Token Received' : 'Failed');

    console.log("\n5. FORGOT PASSWORD");
    let forgotRes = await request('/api/auth/forgot-password', 'POST', { selectedRole: 'admin' }, tempToken);
    console.log(`Forgot Password: ${forgotRes.status}`, forgotRes.data?.message);

    console.log("\nDONE.");
}

runTests();
