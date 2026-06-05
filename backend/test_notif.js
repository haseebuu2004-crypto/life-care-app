const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const baseUrl = 'http://localhost:3000/api';

async function query(text, params) {
  return pool.query(text, params);
}

async function apiRequest(method, path, body, cookie = '') {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (cookie) options.headers['Cookie'] = cookie;
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${baseUrl}${path}`, options);
  
  const setCookieHeader = res.headers.get('set-cookie');
  let newCookie = cookie;
  if (setCookieHeader) {
    const match = setCookieHeader.match(/session_token=([^;]+)/);
    if (match) newCookie = `session_token=${match[1]}`;
  }

  let data = null;
  const text = await res.text();
  try { data = JSON.parse(text); } catch (e) { data = text; }

  return { status: res.status, data, cookie: newCookie };
}

async function runTest() {
  try {
    const adminEmail = `notif_test_${Date.now()}@test.com`;
    console.log("=== SETUP ===");
    const adminPass = 'adminpass123';
    const adminHash = bcrypt.hashSync(adminPass, 12);
    const adminRes = await query(
      `INSERT INTO users (email, password_hash, role, is_active, force_password_change) 
       VALUES ($1, $2, 'admin', true, false) RETURNING id`,
      [adminEmail, adminHash]
    );
    const adminId = adminRes.rows[0].id;
    await query(`UPDATE users SET owner_id = $1 WHERE id = $1`, [adminId]);
    
    // Config: low stock = 5, discount alert = 20%
    await query(`INSERT INTO admin_config (owner_id, low_stock_threshold, discount_alert_pct) VALUES ($1, 5, 20)`, [adminId]);
    
    // Login
    const loginRes = await apiRequest('POST', '/auth/login', { email: adminEmail, password: adminPass });
    const cookie = loginRes.cookie;
    
    // Create Product
    const pRes = await apiRequest('POST', '/products', {
        name: 'Notif Product',
        category: 'Supplements',
        vp: 10,
        standardPrice: 10000,
        vendorPrice: 5000,
        trackStock: true
    }, cookie);
    const productId = pRes.data.product_id;
    const pvRes = await query(`SELECT id FROM product_versions WHERE product_id = $1`, [productId]);
    const pvId = pvRes.rows[0].id;
    
    // Add stock = 6
    await apiRequest('POST', '/stock', { productVersionId: pvId, quantity: 6, notes: 'init' }, cookie);
    
    console.log("=== TEST NOTIFICATIONS ===");
    // Add sale: quantity = 2, price = 5000
    // This will cause: stock drops to 4 (< 5 -> low stock)
    // Discount: price is 5000, standard is 10000 -> 50% discount (> 20% -> large discount)
    const saleRes = await apiRequest('POST', '/sales', {
        items: [{
            productVersionId: pvId,
            quantity: 2,
            priceCharged: 5000
        }]
    }, cookie);
    
    console.log(`Sale response: ${saleRes.status}`);
    
    const notifs = await query(`SELECT type, title FROM notifications WHERE user_id = $1`, [adminId]);
    console.log("Notifications:");
    console.table(notifs.rows);
    
    if (notifs.rows.some(n => n.type === 'low_stock') && notifs.rows.some(n => n.type === 'large_discount')) {
        console.log("Result: MATCH");
    } else {
        console.log("Result: FAIL");
    }
  } catch (e) {
      console.error(e);
  } finally {
      process.exit();
  }
}
runTest();
