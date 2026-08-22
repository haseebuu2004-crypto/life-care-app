require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');

const BASE_URL = 'http://localhost:3000/api';
let masterCookie = '';
let adminCookie = '';
let masterId = null;
let adminId = null;
let adminEmail = 'evidence_admin3@test.com';
let adminPass = 'password123';

async function api(path, method = 'GET', body = null, cookie = '') {
    const opts = { method, headers: { 'Content-Type': 'application/json', 'Cookie': cookie } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(BASE_URL + path, opts);
    let data;
    try { data = await res.json(); } catch(e) { data = await res.text(); }
    if (res.status >= 400) {
        console.error(`API Error ${method} ${path} -> ${res.status}:`, data);
    }
    return { status: res.status, data, headers: res.headers };
}

async function runEvidence() {
    try {
        console.log("=== SETUP ===");
        const hash = await bcrypt.hash('masterpass', 12);
        
        await db.query(`DELETE FROM users WHERE email LIKE '%evidence%'`); // cleanup previous tests

        const ins = await db.query(`INSERT INTO users (email, password_hash, role, is_active) VALUES ('evidence_master3@test.com', $1, 'master', true) RETURNING id`, [hash]);
        masterId = ins.rows[0].id;
        
        const loginRes = await api('/auth/login', 'POST', { email: 'evidence_master3@test.com', password: 'masterpass' });
        masterCookie = loginRes.headers.get('set-cookie').split(';')[0];
        
        const createRes = await api('/master/admins', 'POST', { email: adminEmail }, masterCookie);
        adminPass = createRes.data.tempPassword;
        
        const adminUser = await db.query(`SELECT id FROM users WHERE email = $1`, [adminEmail]);
        adminId = adminUser.rows[0].id;

        // Admin logs in to create a session
        const adminLogin1 = await api('/auth/login', 'POST', { email: adminEmail, password: adminPass });
        if (!adminLogin1.headers.get('set-cookie')) throw new Error("Admin login failed");
        adminCookie = adminLogin1.headers.get('set-cookie').split(';')[0];
        console.log("Admin logged in. Active session exists.");
        
        // Find session id
        const preSession = await db.query(`SELECT id, invalidated_at FROM sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`, [adminId]);
        console.log(`Pre-Deactivation Session ID: ${preSession.rows[0].id}, Invalidated At: ${preSession.rows[0].invalidated_at}`);

        console.log("\n================================================================");
        console.log("TASK 2 — SESSION INVALIDATION PROOF (TEST 9)");
        console.log("================================================================");
        
        // Master deactivates admin
        const deactRes = await api(`/master/admins/${adminId}/toggle-status`, 'PUT', {}, masterCookie);
        console.log("Master deactivated admin. API Status:", deactRes.status);
        
        // Check invalidated_at in DB
        const postSession = await db.query(`SELECT id, invalidated_at FROM sessions WHERE id = $1`, [preSession.rows[0].id]);
        console.log(`Post-Deactivation Invalidated At: ${postSession.rows[0].invalidated_at}`);
        
        // Next request using invalidated session cookie
        const nextReq = await api('/auth/session', 'GET', null, adminCookie);
        console.log("Next request using old session cookie API Status:", nextReq.status);
        
        if (postSession.rows[0].invalidated_at !== null && (nextReq.status === 401 || nextReq.status === 403)) {
            console.log("Session rejected on next request.");
            console.log("Result: MATCH");
        } else {
            console.log("Result: FAIL");
        }

    } catch (e) {
        console.error(e);
    } finally {
        if (adminId) await db.query(`DELETE FROM sessions WHERE user_id = $1`, [adminId]).catch(()=>null);
        if (adminId) await db.query(`DELETE FROM audit_log WHERE user_id = $1 OR actor_id = $1`, [adminId]).catch(()=>null);
        if (masterId) await db.query(`DELETE FROM audit_log WHERE user_id = $1 OR actor_id = $1`, [masterId]).catch(()=>null);
        if (adminId) await db.query(`DELETE FROM admin_config WHERE owner_id = $1`, [adminId]).catch(()=>null);
        if (adminId) await db.query(`DELETE FROM users WHERE id = $1`, [adminId]).catch(()=>null);
        if (masterId) await db.query(`DELETE FROM users WHERE id = $1`, [masterId]).catch(()=>null);
        process.exit(0);
    }
}

runEvidence();
