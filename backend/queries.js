require('dotenv').config();
const http = require('http');
const db = require('./shared/db/connection');
const authService = require('./features/auth/auth.service');

function apiCall(method, path, payload, token) {
    return new Promise((resolve, reject) => {
        const postData = payload ? JSON.stringify(payload) : '';
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: { 'Cookie': `session_token=${token}` }
        };
        if (payload) {
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }
        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try { parsed = JSON.parse(data); } catch (e) {}
                resolve({ status: res.statusCode, data: parsed });
            });
        });
        req.on('error', reject);
        if (payload) req.write(postData);
        req.end();
    });
}
(async () => {
    const client = await db.pool.connect();
    const userRes = await client.query(`SELECT id FROM users LIMIT 1`);
    const userId = userRes.rows[0].id;
    const token = await authService.createNewSession(userId, '127.0.0.1', 'test_script');

    const p1Res = await client.query(`INSERT INTO products (id, name, owner_id) VALUES (gen_random_uuid(), 'Formula 1 Test', $1) RETURNING id`, [userId]);
    const f1Id = p1Res.rows[0].id;
    const pv1Res = await client.query(`INSERT INTO product_versions (id, product_id, vendor_price, volume_points) VALUES (gen_random_uuid(), $1, 1000, 10) RETURNING id`, [f1Id]);
    const pv1Id = pv1Res.rows[0].id;
    const vChocoRes = await client.query(`INSERT INTO variants (id, product_version_id, name, is_active) VALUES (gen_random_uuid(), $1, 'Choco Test', true) RETURNING id`, [pv1Id]);
    const vChoco = vChocoRes.rows[0].id;

    const res = await apiCall('POST', '/api/stock', { inventoryId: vChoco, quantity: 10 }, token);
    console.dir(res, {depth: null});

    await client.query(`DELETE FROM stock WHERE variant_id = $1`, [vChoco]);
    await client.query(`DELETE FROM variants WHERE id = $1`, [vChoco]);
    await client.query(`DELETE FROM product_versions WHERE id = $1`, [pv1Id]);
    await client.query(`DELETE FROM products WHERE id = $1`, [f1Id]);
    client.release();
    process.exit(0);
})();
