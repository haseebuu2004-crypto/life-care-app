require('dotenv').config();
// Only import db and authService directly to avoid Jest ESM issues with server.js dependencies
const db = require('../shared/db/connection');
jest.setTimeout(30000);

// We use an admin user from the database or create one for testing.
// Assuming admin@system.local or similar exists, but let's mock the db queries directly or seed a test user.

describe('Concurrent Login Policy', () => {
    let testUser;
    
    beforeAll(async () => {
        // Grab any user to test
        const res = await db.query(`SELECT * FROM users LIMIT 1`);
        if (res.rows.length === 0) {
            throw new Error("No users found to test with");
        }
        testUser = res.rows[0];
        
        // Clear all existing sessions for test user
        await db.query(`DELETE FROM sessions WHERE user_id = $1`, [testUser.id]);
    });

    afterAll(async () => {
        await db.query(`DELETE FROM sessions WHERE user_id = $1`, [testUser.id]);
        await db.pool.end();
    });

    afterEach(async () => {
        await db.query(`DELETE FROM sessions WHERE user_id = $1`, [testUser.id]);
    });

    it('should allow login within the limit (up to 3 sessions)', async () => {
        const authService = require('../features/auth/auth.service');
        
        // Mocking login is harder than just using the authService directly
        // We will call the service methods directly to test the policy logic
        
        const s1 = await authService._generateSession(testUser, '1.1.1.1', 'Device 1');
        const s2 = await authService._generateSession(testUser, '1.1.1.2', 'Device 2');
        const s3 = await authService._generateSession(testUser, '1.1.1.3', 'Device 3');

        // Check active sessions
        const active = await authService.getActiveSessions(testUser.id, s3.rawToken);
        expect(active).toHaveLength(3);
    });

    it('should evict the oldest session when a 4th login occurs', async () => {
        const authService = require('../features/auth/auth.service');
        
        const s1 = await authService._generateSession(testUser, '1.1.1.1', 'Device 1');
        // Wait a tiny bit so timestamps are definitely ordered
        await new Promise(r => setTimeout(r, 10));
        const s2 = await authService._generateSession(testUser, '1.1.1.2', 'Device 2');
        await new Promise(r => setTimeout(r, 10));
        const s3 = await authService._generateSession(testUser, '1.1.1.3', 'Device 3');
        await new Promise(r => setTimeout(r, 10));
        
        // 4th login should evict s1
        const s4 = await authService._generateSession(testUser, '1.1.1.4', 'Device 4');

        const active = await authService.getActiveSessions(testUser.id, s4.rawToken);
        expect(active).toHaveLength(3);
        
        // Validate s1 is invalid
        await expect(authService.validateSession(s1.rawToken)).rejects.toThrow('Access denied: Invalid or expired session');
        
        // Validate s2, s3, s4 are valid
        await expect(authService.validateSession(s2.rawToken)).resolves.toBeDefined();
        await expect(authService.validateSession(s3.rawToken)).resolves.toBeDefined();
        await expect(authService.validateSession(s4.rawToken)).resolves.toBeDefined();
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
