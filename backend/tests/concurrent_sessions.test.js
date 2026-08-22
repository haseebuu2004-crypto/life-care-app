require('dotenv').config();
// Only import db and authService directly to avoid Jest ESM issues with server.js dependencies
const db = require('../shared/db/connection');
jest.setTimeout(120000);

// We use an admin user from the database or create one for testing.
// Assuming admin@system.local or similar exists, but let's mock the db queries directly or seed a test user.

describe('Concurrent Login Policy', () => {
    let testUser;
    let testUserId = null;

    beforeAll(async () => {
        // Create a test user for auth
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash('password123', 10);
        const testEmail = `testadmin_${Date.now()}@test.com`;
        
        const res = await db.query(
            `INSERT INTO users (email, password_hash, role, is_active) VALUES ($1, $2, $3, true) RETURNING id`,
            [testEmail, hash, 'admin']
        );
        testUserId = res.rows[0].id;
        
        // Fetch the full user object
        const userRes = await db.query(`SELECT * FROM users WHERE id = $1`, [testUserId]);
        testUser = userRes.rows[0];
        
        // Set owner_id to self
        await db.query(`UPDATE users SET owner_id = id WHERE id = $1`, [testUserId]);
        
        // Clear all existing sessions for test user
        await db.query(`DELETE FROM sessions WHERE user_id = $1`, [testUserId]);
    });

    afterAll(async () => {
        try {
            if (testUserId) {
                await db.query(`DELETE FROM sessions WHERE user_id = $1`, [testUserId]);
                await db.query(`DELETE FROM audit_log WHERE actor_id = $1`, [testUserId]);
                await db.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
            }
        } catch (e) {
            console.error("Teardown error ignored:", e.message);
        }
        await db.pool.end();
    });

    afterEach(async () => {
        await db.query(`DELETE FROM sessions WHERE user_id = $1`, [testUser.id]);
    });

    it('should allow login within the limit (up to 100 sessions)', async () => {
        const authService = require('../features/auth/auth.service');
        
        const s1 = await authService._generateSession(testUser, '1.1.1.1', 'Device 1');
        const s2 = await authService._generateSession(testUser, '1.1.1.2', 'Device 2');
        const s3 = await authService._generateSession(testUser, '1.1.1.3', 'Device 3');

        // Check active sessions
        const active = await authService.getActiveSessions(testUser.id, s3.rawToken);
        expect(active).toHaveLength(3);
    });

    it('should evict the oldest session when a 101st login occurs', async () => {
        const authService = require('../features/auth/auth.service');
        
        let sessions = [];
        // 1st session (absolute oldest)
        const s1 = await authService._generateSession(testUser, `1.1.1.1`, `Device 1`);
        sessions.push(s1);
        await new Promise(r => setTimeout(r, 10));
        
        // Generate next 98 sessions concurrently for speed
        let promises = [];
        for (let i = 2; i <= 99; i++) {
            promises.push(authService._generateSession(testUser, `1.1.1.${i}`, `Device ${i}`));
        }
        const batch1 = await Promise.all(promises);
        sessions.push(...batch1);
        
        await new Promise(r => setTimeout(r, 10));
        
        // 100th session
        sessions.push(await authService._generateSession(testUser, `1.1.1.100`, `Device 100`));
        await new Promise(r => setTimeout(r, 10));
        
        // 101st session (should trigger eviction)
        sessions.push(await authService._generateSession(testUser, `1.1.1.101`, `Device 101`));
        
        const s100 = sessions[99];
        const s101 = sessions[100];
        const active = await authService.getActiveSessions(testUser.id, s101.rawToken);
        expect(active).toHaveLength(100);
        
        // Validate s1 is invalid (evicted)
        await expect(authService.validateSession(s1.rawToken)).rejects.toThrow('Access denied: Invalid or expired session');
        
        // Validate newer sessions are valid
        await expect(authService.validateSession(s100.rawToken)).resolves.toBeDefined();
        await expect(authService.validateSession(s101.rawToken)).resolves.toBeDefined();
    });

    it('should allow logout of one session while leaving others active', async () => {
        const authService = require('../features/auth/auth.service');
        
        const s1 = await authService._generateSession(testUser, '1.1.1.1', 'Device 1');
        const s2 = await authService._generateSession(testUser, '1.1.1.2', 'Device 2');
        
        // Logout s1
        await authService.logout(s1.rawToken, testUser.id);
        
        // s1 should be invalid
        await expect(authService.validateSession(s1.rawToken)).rejects.toThrow('Access denied: Invalid or expired session');
        
        // s2 should still be valid
        await expect(authService.validateSession(s2.rawToken)).resolves.toBeDefined();
        
        const active = await authService.getActiveSessions(testUser.id, null);
        expect(active).toHaveLength(1);
    });
});
