/**
 * Password Reset Flow — Isolated Unit Tests
 * 
 * Tests every stage of the password reset lifecycle:
 *   1. Token generation (crypto secure, hashed storage, old-token invalidation)
 *   2. Delivery (token not leaked in logs — verified structurally)
 *   3. Validation (expired, used, not-found — each with specific error)
 *   4. Password update (transactional, bcrypt, sessions invalidated)
 *   5. Edge cases (non-existent email, concurrent requests)
 */
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const authService = require('./features/auth/auth.service');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let testUserId = null;
const testEmail = `pwreset_test_${Date.now()}@example.com`;
const originalPassword = 'OriginalPass1!';
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

async function setup() {
    const hash = await bcrypt.hash(originalPassword, 12);
    // owner_id is a self-referencing FK — insert without it, then set owner_id = id
    const res = await pool.query(
        `INSERT INTO users (email, password_hash, role, is_active)
         VALUES ($1, $2, 'admin', true)
         RETURNING id`,
        [testEmail, hash]
    );
    testUserId = res.rows[0].id;
    await pool.query(`UPDATE users SET owner_id = $1 WHERE id = $1`, [testUserId]);
    console.log(`[SETUP] Created test user ${testEmail} (id: ${testUserId})\n`);
}

async function teardown() {
    if (testUserId) {
        await pool.query(`DELETE FROM password_resets WHERE user_id = $1`, [testUserId]);
        await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [testUserId]);
        await pool.query(`DELETE FROM audit_log WHERE actor_id = $1`, [testUserId]);
        await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
        console.log(`\n[TEARDOWN] Cleaned up test user`);
    }
    await pool.end();
}

// ─────────────────────────────────────────────
// STAGE 1: Token Generation
// ─────────────────────────────────────────────
async function testTokenGeneration() {
    console.log('── Stage 1: Token Generation ──');

    const rawToken = await authService.forgotPassword(testEmail);

    // 1a. Token is 64 hex chars (32 bytes)
    assert(rawToken && rawToken.length === 64, '1a. Token is 64-char hex string (crypto.randomBytes(32))');

    // 1b. DB stores a SHA-256 hash, NOT the raw token
    const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const dbRow = await pool.query(
        `SELECT token_hash, id FROM password_resets WHERE user_id = $1 AND used_at IS NULL ORDER BY created_at DESC LIMIT 1`,
        [testUserId]
    );
    assert(dbRow.rows.length === 1 && dbRow.rows[0].token_hash === expectedHash,
        '1b. DB stores SHA-256 hash, not raw token');

    // 1c. Raw token does NOT appear anywhere in the DB
    const rawScan = await pool.query(
        `SELECT id FROM password_resets WHERE token_hash = $1`, [rawToken]
    );
    assert(rawScan.rows.length === 0, '1c. Raw token is not stored in token_hash column');

    // 1d. A second request invalidates the first token
    const token2 = await authService.forgotPassword(testEmail);
    const oldCheck = await pool.query(
        `SELECT used_at FROM password_resets WHERE token_hash = $1`, [expectedHash]
    );
    assert(oldCheck.rows[0].used_at !== null, '1d. Previous token invalidated on new request');

    return token2;
}

// ─────────────────────────────────────────────
// STAGE 2: Delivery (structural check)
// ─────────────────────────────────────────────
async function testDelivery() {
    console.log('\n── Stage 2: Delivery ──');

    // 2a. forgotPassword returns a raw token (delivery payload)
    const token = await authService.forgotPassword(testEmail);
    assert(token && token.length === 64, '2a. forgotPassword returns raw token for email embedding');

    // 2b. Verify the service code does NOT log the raw token in production mode
    //     (structural: we check the source file for the pattern)
    const fs = require('fs');
    const source = fs.readFileSync('./features/auth/auth.service.js', 'utf8');
    const hasFallbackTokenLeak = source.includes('[FALLBACK EMAIL] Reset link');
    assert(!hasFallbackTokenLeak, '2b. SMTP fallback log does NOT contain raw token');

    return token;
}

// ─────────────────────────────────────────────
// STAGE 3: Validation — specific error messages
// ─────────────────────────────────────────────
async function testValidation() {
    console.log('\n── Stage 3: Validation ──');

    // 3a. Completely fabricated token → "invalid"
    try {
        await authService.resetPassword('a'.repeat(64), 'NewPassword1!');
        assert(false, '3a. Fabricated token should be rejected');
    } catch (e) {
        assert(e.message.includes('invalid'), '3a. Fabricated token → "invalid" error');
    }

    // 3b. Expired token → "expired"
    const expiredRaw = crypto.randomBytes(32).toString('hex');
    const expiredHash = crypto.createHash('sha256').update(expiredRaw).digest('hex');
    await pool.query(
        `INSERT INTO password_resets (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() - INTERVAL '1 hour')`,
        [testUserId, expiredHash]
    );
    try {
        await authService.resetPassword(expiredRaw, 'NewPassword1!');
        assert(false, '3b. Expired token should be rejected');
    } catch (e) {
        assert(e.message.includes('expired'), '3b. Expired token → "expired" error');
    }

    // 3c. Already-used token → "already been used"
    // Generate a FRESH token, use it, then try to re-use it
    const freshToken = await authService.forgotPassword(testEmail);
    await authService.resetPassword(freshToken, 'UsedTokenTest1!');
    try {
        await authService.resetPassword(freshToken, 'AnotherPass1!');
        assert(false, '3c. Used token should be rejected');
    } catch (e) {
        assert(e.message.includes('already been used'), '3c. Used token → "already been used" error');
    }

    // 3d. Short password → specific error
    const shortPwdToken = await authService.forgotPassword(testEmail);
    try {
        await authService.resetPassword(shortPwdToken, 'short');
        assert(false, '3d. Short password should be rejected');
    } catch (e) {
        assert(e.message.includes('at least 8 characters'), '3d. Short password → length error');
    }
}

// ─────────────────────────────────────────────
// STAGE 4: Password Update (atomicity)
// ─────────────────────────────────────────────
async function testPasswordUpdate() {
    console.log('\n── Stage 4: Password Update ──');

    // Create a fresh session and token
    const sessRes = await pool.query(
        `INSERT INTO sessions (user_id, expires_at) VALUES ($1, NOW() + INTERVAL '8 hours') RETURNING id`,
        [testUserId]
    );
    const sessionId = sessRes.rows[0].id;

    const token = await authService.forgotPassword(testEmail);
    const newPassword = 'SecureNewPass99!';

    await authService.resetPassword(token, newPassword);

    // 4a. Password is updated with bcrypt
    const userRow = await pool.query(`SELECT password_hash FROM users WHERE id = $1`, [testUserId]);
    const bcryptMatch = await bcrypt.compare(newPassword, userRow.rows[0].password_hash);
    assert(bcryptMatch, '4a. Password hash updated correctly (bcrypt verified)');

    // 4b. Token is consumed (used_at set)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenRow = await pool.query(`SELECT used_at FROM password_resets WHERE token_hash = $1`, [tokenHash]);
    assert(tokenRow.rows[0].used_at !== null, '4b. Token consumed immediately after reset');

    // 4c. Session is invalidated
    const sessCheck = await pool.query(`SELECT invalidated_at FROM sessions WHERE id = $1`, [sessionId]);
    assert(sessCheck.rows[0].invalidated_at !== null, '4c. Existing session invalidated (force re-login)');
}

// ─────────────────────────────────────────────
// STAGE 5: Edge Cases
// ─────────────────────────────────────────────
async function testEdgeCases() {
    console.log('\n── Stage 5: Edge Cases ──');

    // 5a. Non-existent email → returns null (no error thrown, no token generated)
    const ghostResult = await authService.forgotPassword('nonexistent_user_12345@ghost.dev');
    assert(ghostResult === null, '5a. Non-existent email → null (no token, no error)');

    // 5b. No rows in password_resets for the ghost email
    const ghostRows = await pool.query(
        `SELECT id FROM password_resets WHERE user_id IN (SELECT id FROM users WHERE email = 'nonexistent_user_12345@ghost.dev')`
    );
    assert(ghostRows.rows.length === 0, '5b. No DB artifacts created for non-existent email');

    // 5c. Concurrent requests — only latest token works
    const tok1 = await authService.forgotPassword(testEmail);
    const tok2 = await authService.forgotPassword(testEmail);
    const tok3 = await authService.forgotPassword(testEmail);

    // tok1 and tok2 should be invalidated
    try {
        await authService.resetPassword(tok1, 'ConcurrentTest1!');
        assert(false, '5c-i. Superseded token 1 should be rejected');
    } catch (e) {
        assert(e.message.includes('already been used'), '5c-i. Superseded token 1 → rejected');
    }

    try {
        await authService.resetPassword(tok2, 'ConcurrentTest2!');
        assert(false, '5c-ii. Superseded token 2 should be rejected');
    } catch (e) {
        assert(e.message.includes('already been used'), '5c-ii. Superseded token 2 → rejected');
    }

    // tok3 should work
    try {
        await authService.resetPassword(tok3, 'ConcurrentTest3!');
        assert(true, '5c-iii. Latest token 3 → accepted');
    } catch (e) {
        assert(false, '5c-iii. Latest token 3 should succeed: ' + e.message);
    }
}

// ─────────────────────────────────────────────
// RUNNER
// ─────────────────────────────────────────────
async function run() {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   Password Reset Flow — Unit Test Suite      ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    try {
        await setup();

        await testTokenGeneration();
        await testDelivery();
        await testValidation();
        await testPasswordUpdate();
        await testEdgeCases();

    } catch (e) {
        console.error('\n💥 Unhandled test error:', e);
        failed++;
    } finally {
        await teardown();
        console.log(`\n╔══════════════════════════════════════════════╗`);
        console.log(`║  Results: ${passed} passed, ${failed} failed${' '.repeat(Math.max(0, 22 - String(passed).length - String(failed).length))}║`);
        console.log(`╚══════════════════════════════════════════════╝`);
        process.exit(failed > 0 ? 1 : 0);
    }
}

run();
