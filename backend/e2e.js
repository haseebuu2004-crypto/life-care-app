require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/life_care'
});

const baseUrl = 'http://localhost:3000/api';
let currentCookie = '';

async function api(method, path, body) {
    console.log(`[API] ${method} ${path}`);
    const res = await fetch(baseUrl + path, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Cookie': currentCookie
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) currentCookie = setCookie;
    
    if (!res.ok) {
        throw new Error(`[API ERROR] ${res.status} ${res.statusText} - ${await res.text()}`);
    }
    return { data: await res.json() };
}

async function runE2E() {
    let cookie = '';
    let ownerId = '';
    
    try {
        const hashRes = await pool.query("SELECT crypt('password123', gen_salt('bf')) as hash");
        const hash = hashRes.rows[0].hash;
        
        let userRes = await pool.query("SELECT id FROM users WHERE email = 'e2e_admin@example.com'");
        if (userRes.rows.length === 0) {
            userRes = await pool.query("INSERT INTO users (email, password_hash, role) VALUES ('e2e_admin@example.com', $1, 'admin') RETURNING id", [hash]);
        } else {
            // Update password just in case
            await pool.query("UPDATE users SET password_hash = $1 WHERE email = 'e2e_admin@example.com'", [hash]);
        }
        ownerId = userRes.rows[0].id;

        // 1. Login as Admin
        const loginRes = await api('POST', '/auth/login', { email: 'e2e_admin@example.com', password: 'password123' });
        
        console.log("Logged in.");

        // Clean up previous test products to avoid duplicates
        const oldProducts = await pool.query("SELECT id FROM products WHERE name = 'E2E Shake'");
        if (oldProducts.rows.length > 0) {
            const pId = oldProducts.rows[0].id;
            // Delete sales, stock, product_versions, products
            await pool.query("DELETE FROM sale_items WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [pId]);
            await pool.query("DELETE FROM sales WHERE id NOT IN (SELECT sale_id FROM sale_items)"); // cleanup empty sales
            await pool.query("DELETE FROM stock WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [pId]);
            await pool.query("DELETE FROM product_versions WHERE product_id = $1", [pId]);
            await pool.query("DELETE FROM products WHERE id = $1", [pId]);
        }

        // 2. Create Product
        const pRes = await api('POST', '/products', { name: 'E2E Shake', vendor_price: 1000 });
        const productId = pRes.data.product_id;
        console.log("Created product:", productId);

        // Add Stock so we can sell
        const prodDb = await pool.query("SELECT id FROM product_versions WHERE product_id = $1 AND is_active = true", [productId]);
        const pvid1 = prodDb.rows[0].id;

        await api('POST', '/stock', { variantId: pvid1, quantity: 100 });
        console.log("Added stock.");

        // 3. Sell 1 at standard price (2000)
        const cRes = await api('POST', '/customers', { name: 'E2E Customer', phone: '9999999999' });
        const custId = cRes.data.customer_id || (await pool.query("SELECT id FROM customers LIMIT 1")).rows[0].id;

        const sale1 = await api('POST', '/sales', {
            customer_id: custId,
            sale_date: new Date().toISOString(),
            items: [{ 
                product_version_id: pvid1, 
                quantity: 1, 
                price_charged: 2000, 
                standard_price_snap: 2000, 
                vendor_price_snap: 1000 
            }]
        });
        console.log("Sale 1 done.");

        // 4. Change standard price to 2500
        await api('PUT', `/products/${productId}/price`, { vendor_price: 1200 });
        const prodDb2 = await pool.query("SELECT id FROM product_versions WHERE product_id = $1 AND is_active = true", [productId]);
        const pvid2 = prodDb2.rows[0].id;
        console.log("Changed price, new pvid:", pvid2);

        // Add stock to new version
        await api('POST', '/stock', { variantId: pvid2, quantity: 100 });

        // 5. Sell 1 at NEW standard price (2500)
        const sale2 = await api('POST', '/sales', {
            customer_id: custId,
            sale_date: new Date().toISOString(),
            items: [{ 
                product_version_id: pvid2, 
                quantity: 1, 
                price_charged: 2500, 
                standard_price_snap: 2500, 
                vendor_price_snap: 1200 
            }]
        });
        console.log("Sale 2 done.");

        // 6. Sell 1 at custom price (2400)
        const sale3 = await api('POST', '/sales', {
            customer_id: custId,
            sale_date: new Date().toISOString(),
            items: [{ 
                product_version_id: pvid2, 
                quantity: 1, 
                price_charged: 2400, 
                standard_price_snap: 2500, 
                vendor_price_snap: 1200 
            }]
        });
        console.log("Sale 3 done.");

        // 7. Verify DB
        const result = await pool.query(`
            SELECT p.name, si.quantity, si.price_charged, si.standard_price_snap, si.vendor_price_snap 
            FROM sale_items si
            JOIN product_versions pv ON si.product_version_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE p.name = 'E2E Shake'
            ORDER BY si.id ASC
        `);
        
        console.log("--- DB RESULTS ---");
        console.table(result.rows);
        console.log("------------------");

        const oldProducts2 = await pool.query("SELECT id FROM products WHERE name = 'E2E Shake'");
        if (oldProducts2.rows.length > 0) {
            const pId = oldProducts2.rows[0].id;
            await pool.query("DELETE FROM sale_items WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [pId]);
            await pool.query("DELETE FROM stock WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [pId]);
            await pool.query("DELETE FROM product_versions WHERE product_id = $1", [pId]);
            await pool.query("DELETE FROM products WHERE id = $1", [pId]);
        }
        // Do not delete user to prevent FK errors with other entities created by them.
    } catch (e) {
        console.error("Test failed:", e);
    } finally {
        process.exit();
    }
}

runE2E();
