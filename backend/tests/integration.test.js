const request = require('supertest');
const app = require('../server');
const db = require('../shared/db/connection');

let authToken = '';
let createdProductId = '';
let createdVariantId = '';
let testUserId = '';
let testEmail = '';

beforeAll(async () => {
    // Ensure tables exist and seeded
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a test user for auth
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    testEmail = `testadmin_${Date.now()}@test.com`;
    const res = await db.pool.query(
        `INSERT INTO users (email, password_hash, role, is_active) VALUES ($1, $2, $3, true) RETURNING id`,
        [testEmail, hash, 'admin']
    );
    testUserId = res.rows[0].id;
    // Set owner_id to self so tests pass constraints
    await db.pool.query(`UPDATE users SET owner_id = id WHERE id = $1`, [testUserId]);
});

afterAll(async () => {
    // Cleanup test data
    try {
        if (createdProductId) {
            await db.pool.query("DELETE FROM variants WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [createdProductId]);
            await db.pool.query("DELETE FROM product_versions WHERE product_id = $1", [createdProductId]);
            await db.pool.query("DELETE FROM products WHERE id = $1", [createdProductId]);
        }
        if (testUserId) {
            await db.pool.query(`DELETE FROM audit_log WHERE actor_id = $1`, [testUserId]);
            await db.pool.query(`DELETE FROM sessions WHERE user_id = $1`, [testUserId]);
            await db.pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
        }
    } catch (e) {
        console.error("Teardown error ignored:", e.message);
    }
    await db.pool.end();
});

describe('1. Auth Integration', () => {
    it('should reject login with missing credentials', async () => {
        const res = await request(app).post('/api/auth/login').send({});
        expect(res.status).toBe(400); // Zod validation
    });

    it('should reject login with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: 'wrongpassword' });
        expect(res.status).toBe(401);
    });

    it('should login successfully as admin', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: 'password123' });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.session_token).toBeDefined();
        authToken = res.body.session_token; // Save for next tests
    });
});

describe('1.5 System Integration', () => {
    it('should return 200 OK from /health when DB is connected', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.database).toBe('connected');
    });
});

describe('2. Products CRUD Integration', () => {
    it('should create a new product', async () => {
        const productName = `TestProduct_${Date.now()}`;
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: productName,
                vendor_price: 150,
                flavor: 'Default Flavor'
            });
            
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.product_id).toBeDefined();
        
        createdProductId = res.body.product_id;
    });
    
    it('should add a variant to the product', async () => {
        const res = await request(app)
            .post('/api/variants')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'Strawberry',
                product_id: createdProductId
            });
            
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
    
    it('should fetch all products and include the new one', async () => {
        const res = await request(app)
            .get('/api/products')
            .set('Authorization', `Bearer ${authToken}`);
            
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        
        const found = res.body.data.find(p => p.id === createdProductId);
        expect(found).toBeDefined();
    });
});
