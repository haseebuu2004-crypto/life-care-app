require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');

const BASE_URL = 'http://localhost:3000/api';

async function api(path, method = 'GET', body = null, cookie = '') {
    const opts = { method, headers: { 'Content-Type': 'application/json', 'Cookie': cookie } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(BASE_URL + path, opts);
    let data;
    try { data = await res.json(); } catch(e) { data = await res.text(); }
    return { status: res.status, data, headers: res.headers };
}

async function runHardening() {
    let testUserId = null;
    let cookie = '';
    try {
        console.log("=== SETUP ===");
        const hash = await bcrypt.hash('testpass', 12);
        
        const ins = await db.query(`
            INSERT INTO users (email, password_hash, role, is_active, force_password_change) 
            VALUES ('hardening_test@test.com', $1, 'user', true, true) 
            RETURNING id`, [hash]);
        testUserId = ins.rows[0].id;

        const loginRes = await api('/auth/login', 'POST', { email: 'hardening_test@test.com', password: 'testpass' });
        cookie = loginRes.headers.get('set-cookie').split(';')[0];
        console.log("Logged in user with force_password_change = true");

        console.log("\n========================================================");
        console.log("TASK 3 — FORCE PASSWORD CHANGE AUDIT");
        console.log("========================================================");
        
        // 1. Access dashboard route
        const dashRes = await api('/dashboard/stats', 'GET', null, cookie);
        console.log(`Access: /dashboard/stats`);
        console.log(`Expected: 403. Actual: ${dashRes.status}`);

        // 2. Access /auth/change-password
        // Note: we might not have a valid currentPassword in the payload for a real change, but the middleware should allow the route
        // Wait, change-password is PUT or POST? It's POST /auth/change-password
        const changeRes = await api('/auth/change-password', 'POST', { currentPassword: 'testpass', newPassword: 'newpass123' }, cookie);
        console.log(`Access: /auth/change-password`);
        console.log(`Expected: 200 (Allowed). Actual: ${changeRes.status}`);
        
        // Let's reset it back to force_password_change = true to test logout, or just test logout (logout deletes session)
        await db.query(`UPDATE users SET force_password_change = true WHERE id = $1`, [testUserId]);
        
        // Re-login to get fresh cookie for logout test
        const loginRes2 = await api('/auth/login', 'POST', { email: 'hardening_test@test.com', password: 'newpass123' });
        cookie = loginRes2.headers.get('set-cookie').split(';')[0];

        // 3. Access /auth/logout
        const logoutRes = await api('/auth/logout', 'POST', null, cookie);
        console.log(`Access: /auth/logout`);
        console.log(`Expected: 200 (Allowed). Actual: ${logoutRes.status}`);
        
        if (dashRes.status === 403 && changeRes.status === 200 && logoutRes.status === 200) {
            console.log("Result: MATCH");
        } else {
            console.log("Result: FAIL");
        }

    } catch (e) {
        console.error(e);
    } finally {
        if (testUserId) await db.query(`DELETE FROM sessions WHERE user_id = $1`, [testUserId]).catch(()=>null);
        if (testUserId) await db.query(`DELETE FROM audit_log WHERE user_id = $1 OR actor_id = $1`, [testUserId]).catch(()=>null);
        if (testUserId) await db.query(`DELETE FROM users WHERE id = $1`, [testUserId]).catch(()=>null);
        process.exit(0);
    }
}

runHardening();
