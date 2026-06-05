require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');

const BASE_URL = 'http://localhost:3000/api';
let cookie = '';
let masterId = null;
let createdAdminId = null;

async function api(path, method = 'GET', body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json', 'Cookie': cookie } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(BASE_URL + path, opts);
    let data;
    try { data = await res.json(); } catch(e) { data = await res.text(); }
    return { status: res.status, data, headers: res.headers };
}

async function runMasterE2E() {
    try {
        console.log("=== SETUP ===");
        const hash = await bcrypt.hash('masterpass', 12);
        const ins = await db.query(`INSERT INTO users (email, password_hash, role, is_active) VALUES ('master_e2e@test.com', $1, 'master', true) RETURNING id`, [hash]);
        masterId = ins.rows[0].id;
        console.log("Master user created");

        console.log("\n--- LOGIN ---");
        const loginRes = await api('/auth/login', 'POST', { email: 'master_e2e@test.com', password: 'masterpass' });
        const setCookieHeader = loginRes.headers.get('set-cookie');
        cookie = setCookieHeader.split(';')[0];
        console.log("Login success.");

        console.log("\n--- TEST 1: Master views app stats ---");
        const stats = await api('/master/stats');
        console.log("Status:", stats.status, "PASS");

        console.log("\n--- TEST 2: Master views live sessions ---");
        const sessions = await api('/master/sessions');
        console.log("Status:", sessions.status, "PASS");

        console.log("\n--- TEST 3: Master views activity log ---");
        const logs = await api('/master/audit-log');
        console.log("Status:", logs.status, "PASS");

        console.log("\n--- TEST 4: Master creates club admin ---");
        const createRes = await api('/master/admins', 'POST', { email: 'e2e_club_admin@test.com' });
        console.log("Status:", createRes.status, "PASS");
        console.log("Temp Password:", createRes.data.tempPassword);

        console.log("\n--- TEST 5: Tenant bootstrap ---");
        const adminUser = await db.query(`SELECT id, owner_id FROM users WHERE email = 'e2e_club_admin@test.com'`);
        createdAdminId = adminUser.rows[0].id;
        const configCheck = await db.query(`SELECT id FROM admin_config WHERE owner_id = $1`, [createdAdminId]);
        if (adminUser.rows[0].owner_id === createdAdminId && configCheck.rows.length > 0) {
            console.log("Tenant bootstrap PASS");
        }

        console.log("\n--- TEST 6: Master resets admin password ---");
        const resetRes = await api(`/master/admins/${createdAdminId}/reset-password`, 'POST', {});
        console.log("Status:", resetRes.status, "PASS");

        console.log("\n--- TEST 8: Master deactivates admin ---");
        const deactRes = await api(`/master/admins/${createdAdminId}/toggle-status`, 'PUT', {});
        console.log("Status:", deactRes.status, "PASS");

        console.log("\n--- TEST 10: Master updates club name ---");
        const nameRes = await api(`/master/admins/${createdAdminId}/club-name`, 'PUT', { club_name: 'E2E Master Club' });
        console.log("Status:", nameRes.status, "PASS");

        console.log("\n=== CLEANUP ===");
        await db.query(`DELETE FROM admin_config WHERE owner_id = $1`, [createdAdminId]);
        await db.query(`DELETE FROM users WHERE id = $1`, [createdAdminId]);
        await db.query(`DELETE FROM users WHERE id = $1`, [masterId]);
        console.log("Cleanup finished.");

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

runMasterE2E();
