/**
 * Customer Endpoint — Verification Tests
 * 
 * Tests:
 *   1. Valid session, no customer records → HTTP 200 with empty []
 *   2. Invalid/missing session → HTTP 401
 *   3. Confirm no 500 errors on dashboard-style load
 */
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const http = require('http');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let testUserId = null;
let sessionId = null;
const testEmail = `cust_test_${Date.now()}@example.com`;

let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  ✅ ${testName}`);
        passed++;
    } else {
        console.log(`  ❌ ${testName}`);
        failed++;
    }
}

function makeRequest(path, cookie) {
    return new Promise((resolve, reject) => {
        const port = process.env.PORT || 3000;
        const options = {
            hostname: 'localhost',
            port,
            path: `/api${path}`,
            method: 'GET',
            headers: cookie ? { Cookie: `session_token=${cookie}` } : {}
        };
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, body });
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function setup() {
    const hash = await bcrypt.hash('TestPass123!', 12);
    const res = await pool.query(
        `INSERT INTO users (email, password_hash, role, is_active) VALUES ($1, $2, 'admin', true) RETURNING id`,
        [testEmail, hash]
    );
    testUserId = res.rows[0].id;
    await pool.query(`UPDATE users SET owner_id = $1 WHERE id = $1`, [testUserId]);

    // Create a valid session
    const sessRes = await pool.query(
        `INSERT INTO sessions (user_id, expires_at) VALUES ($1, NOW() + INTERVAL '8 hours') RETURNING id`,
        [testUserId]
    );
    sessionId = sessRes.rows[0].id;
    console.log(`[SETUP] Created test user ${testEmail} with session ${sessionId}\n`);
}

async function teardown() {
    if (testUserId) {
        await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [testUserId]);
        await pool.query(`DELETE FROM audit_log WHERE actor_id = $1`, [testUserId]);
        await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
        console.log(`\n[TEARDOWN] Cleaned up`);
    }
    await pool.end();
}

async function runTests() {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  Customer Endpoint — Verification Tests  ║');
    console.log('╚══════════════════════════════════════════╝\n');

    try {
        await setup();

        // Test 1: Valid session, zero customers → 200 with empty data
        console.log('── Test 1: Valid session, no customer records ──');
        const res1 = await makeRequest('/customers', sessionId);
        assert(res1.status === 200, `1a. Status is 200 (got ${res1.status})`);
        assert(res1.body.success === true, '1b. success === true');
        assert(Array.isArray(res1.body.data), '1c. data is an array');
        assert(res1.body.data.length === 0, '1d. data is empty []');

        // Test 2: Missing session → 401
        console.log('\n── Test 2: Missing session ──');
        const res2 = await makeRequest('/customers');
        assert(res2.status === 401, `2a. Status is 401 (got ${res2.status})`);
        assert(res2.body.success === false, '2b. success === false');

        // Test 3: Invalid session → 403 (invalid session, not 500)
        console.log('\n── Test 3: Invalid/expired session ──');
        const res3 = await makeRequest('/customers', '00000000-0000-0000-0000-000000000000');
        assert(res3.status === 403 || res3.status === 401, `3a. Status is 401 or 403, not 500 (got ${res3.status})`);
        assert(res3.body.success === false, '3b. success === false');

        // Test 4: Verify no DB error details leak into 500 response
        console.log('\n── Test 4: Error response does not leak internals ──');
        // We've already verified success paths. Let's ensure the body never contains DB terms
        const allBodies = [res1.body, res2.body, res3.body].map(b => JSON.stringify(b));
        const leakTerms = ['pg_', 'ERROR:', 'column', 'relation', 'stack', 'node_modules'];
        let noLeak = true;
        for (const term of leakTerms) {
            for (const body of allBodies) {
                if (body.toLowerCase().includes(term.toLowerCase())) {
                    noLeak = false;
                    console.log(`  ⚠️ Response contains "${term}"`);
                }
            }
        }
        assert(noLeak, '4a. No DB internals leaked in any response');

    } catch (e) {
        console.error('\n💥 Unhandled test error:', e.message);
        failed++;
    } finally {
        await teardown();
        console.log(`\n╔══════════════════════════════════════════╗`);
        console.log(`║  Results: ${passed} passed, ${failed} failed${' '.repeat(Math.max(0, 20 - String(passed).length - String(failed).length))}║`);
        console.log(`╚══════════════════════════════════════════╝`);
        process.exit(failed > 0 ? 1 : 0);
    }
}

runTests();
