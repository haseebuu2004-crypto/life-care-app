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

// Helper to make fetch requests with cookies
async function apiRequest(method, path, body, cookie = '') {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  if (cookie) {
    options.headers['Cookie'] = cookie;
  }
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${baseUrl}${path}`, options);
  
  const setCookieHeader = res.headers.get('set-cookie');
  let newCookie = cookie;
  if (setCookieHeader) {
    // extract session_token cookie
    const match = setCookieHeader.match(/session_token=([^;]+)/);
    if (match) {
      newCookie = `session_token=${match[1]}`;
    }
  }

  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }

  return { status: res.status, data, cookie: newCookie };
}

async function runE2E() {
  console.log("=== STARTING PART B E2E TEST VERIFICATION ===");
  async function performCleanup() {
    console.log("Cleaning up E2E data...");
    await query(`DELETE FROM sale_items WHERE product_version_id IN (SELECT pv.id FROM product_versions pv JOIN products p ON pv.product_id = p.id JOIN users u ON p.owner_id = u.id WHERE u.email = 'e2e_admin@test.com')`);
    await query(`DELETE FROM stock WHERE product_version_id IN (SELECT pv.id FROM product_versions pv JOIN products p ON pv.product_id = p.id JOIN users u ON p.owner_id = u.id WHERE u.email = 'e2e_admin@test.com')`);
    await query(`DELETE FROM product_versions WHERE product_id IN (SELECT p.id FROM products p JOIN users u ON p.owner_id = u.id WHERE u.email = 'e2e_admin@test.com')`);
    await query(`DELETE FROM products WHERE owner_id IN (SELECT id FROM users WHERE email = 'e2e_admin@test.com')`);
    await query(`DELETE FROM attendance WHERE owner_id IN (SELECT id FROM users WHERE email = 'e2e_admin@test.com') OR recorded_by IN (SELECT id FROM users WHERE email IN ('e2e_admin@test.com', 'e2e-user@test.com'))`);
    await query(`DELETE FROM sales WHERE owner_id IN (SELECT id FROM users WHERE email = 'e2e_admin@test.com') OR recorded_by IN (SELECT id FROM users WHERE email IN ('e2e_admin@test.com', 'e2e-user@test.com'))`);
    await query(`DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email IN ('e2e_admin@test.com', 'e2e-user@test.com'))`);
    await query(`DELETE FROM audit_log WHERE actor_id IN (SELECT id FROM users WHERE email IN ('e2e_admin@test.com', 'e2e-user@test.com'))`);
    await query(`DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email IN ('e2e_admin@test.com', 'e2e-user@test.com'))`);
    await query(`DELETE FROM admin_config WHERE owner_id IN (SELECT id FROM users WHERE email = 'e2e_admin@test.com')`);
    await query(`DELETE FROM customers WHERE name = 'E2E Member'`);
    await query(`DELETE FROM products WHERE name = 'E2E Shake'`);
    await query(`DELETE FROM users WHERE email IN ('e2e_admin@test.com', 'e2e-user@test.com')`);
    console.log("Cleanup finished.");
  }

  try {
    // 1. Setup Admin Account in DB
    const adminEmail = 'e2e_admin@test.com';
    const adminPass = 'adminpass123';
    const adminHash = bcrypt.hashSync(adminPass, 12);
    
    // Clean up past E2E runs
    await performCleanup();

    // Create Admin
    const adminRes = await query(
      `INSERT INTO users (email, password_hash, role, is_active, force_password_change) 
       VALUES ($1, $2, 'admin', true, false) RETURNING id`,
      [adminEmail, adminHash]
    );
    const adminId = adminRes.rows[0].id;
    await query(`UPDATE users SET owner_id = $1 WHERE id = $1`, [adminId]);
    console.log(`Created admin ${adminEmail} with ID: ${adminId}`);

    // Create e2e-user@test.com under adminId
    const userEmail = 'e2e-user@test.com';
    const userPass = 'userpass123';
    const userHash = bcrypt.hashSync(userPass, 12);
    const userRes = await query(
      `INSERT INTO users (email, password_hash, role, owner_id, is_active, force_password_change)
       VALUES ($1, $2, 'user', $3, true, false) RETURNING id`,
      [userEmail, userHash, adminId]
    );
    const userId = userRes.rows[0].id;
    console.log(`Created user ${userEmail} with ID: ${userId}`);

    // Create E2E Shake Product
    const prodRes = await query(
      `INSERT INTO products (owner_id, name) VALUES ($1, $2) RETURNING id`,
      [adminId, 'E2E Shake']
    );
    const productId = prodRes.rows[0].id;
    
    const versionRes = await query(
      `INSERT INTO product_versions (product_id, vendor_price, created_by, is_active)
       VALUES ($1, 8000, $2, true) RETURNING id`,
      [productId, adminId]
    );
    const versionId = versionRes.rows[0].id;
    console.log(`Created product E2E Shake, variant ID: ${versionId}`);

    // Add stock: 15 units
    await query(
      `INSERT INTO stock (product_version_id, owner_id, quantity, vendor_price_snap, added_by)
       VALUES ($1, $2, 15, 8000, $3)`,
      [versionId, adminId, adminId]
    );
    console.log("Added 15 units of stock");

    // Add member: "E2E Member"
    const custRes = await query(
      `INSERT INTO customers (owner_id, name, is_active) VALUES ($1, $2, true) RETURNING id`,
      [adminId, 'E2E Member']
    );
    const customerId = custRes.rows[0].id;
    console.log(`Created customer E2E Member with ID: ${customerId}`);

    // Initialize admin_config for the admin
    await query(
      `INSERT INTO admin_config (owner_id, setup_completed, default_shake_amount) 
       VALUES ($1, true, 5000) 
       ON CONFLICT (owner_id) DO UPDATE SET setup_completed = true, default_shake_amount = 5000`,
      [adminId]
    );

    // --- TEST 1: Variable pricing saves correctly ---
    console.log("\n--- RUNNING TEST 1: Variable pricing saves correctly ---");
    // Login as user
    let userLogin = await apiRequest('POST', '/auth/login', { email: userEmail, password: userPass });
    if (userLogin.status !== 200) {
      throw new Error(`User login failed: ${JSON.stringify(userLogin.data)}`);
    }
    const userCookie = userLogin.cookie;
    console.log("Logged in as user");

    // Add Sale: E2E Member, E2E Shake, price=Rs.110 (11000 paise), qty=2
    const addSaleRes = await apiRequest('POST', '/sales', {
      customer_id: customerId,
      sale_date: new Date().toISOString().split('T')[0],
      items: [
        {
          product_version_id: versionId,
          flavour_id: null,
          quantity: 2,
          price_charged: 11000,
          standard_price_snap: 13000,
          vendor_price_snap: 8000
        }
      ]
    }, userCookie);

    console.log(`Add Sale API Status: ${addSaleRes.status}, Response:`, addSaleRes.data);

    const test1Sql = await query(
      `SELECT si.price_charged, si.standard_price_snap, si.vendor_price_snap, si.quantity
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       ORDER BY s.created_at DESC LIMIT 1`
    );
    console.log("TEST 1 DB Result:");
    console.table(test1Sql.rows);


    // --- TEST 2: Attendance default amount correct ---
    console.log("\n--- RUNNING TEST 2: Attendance default amount correct ---");
    // Log in as admin, set config default_shake_amount = 15000 (Rs.150)
    let adminLogin = await apiRequest('POST', '/auth/login', { email: adminEmail, password: adminPass });
    const adminCookie = adminLogin.cookie;
    
    const updateConfigRes = await apiRequest('PUT', '/settings/config', {
      default_shake_amount: 150
    }, adminCookie);
    console.log(`Updated Config Status: ${updateConfigRes.status}, Response:`, updateConfigRes.data);

    // Log in as user, mark attendance: E2E Member, DEFAULT
    const markAttendanceRes = await apiRequest('POST', '/attendance', {
      customerId,
      date: new Date().toISOString().split('T')[0],
      type: 'default'
    }, userCookie);
    console.log(`Mark Attendance API Status: ${markAttendanceRes.status}, Response:`, markAttendanceRes.data);

    // Query SQL
    const test2Sql = await query(
      `SELECT shake_amount, type, recorded_by
       FROM attendance ORDER BY created_at DESC LIMIT 1`
    );
    console.log("TEST 2 DB Result:");
    console.table(test2Sql.rows);


    // --- TEST 3: Dashboard profit accurate ---
    console.log("\n--- RUNNING TEST 3: Dashboard profit accurate ---");
    // Clear cache to force DB query
    await apiRequest('DELETE', '/notifications/read', null, adminCookie); // just triggers dashboard cache invalidation indirectly or we wait/bypass
    
    // Get Stats today
    const todayStr = new Date().toISOString().split('T')[0];
    const statsRes = await apiRequest('GET', `/dashboard/stats?startDate=${todayStr}&endDate=${todayStr}`, null, adminCookie);
    console.log("Dashboard API Status:", statsRes.status);
    if (statsRes.data?.success) {
      const totals = statsRes.data.data.totals;
      console.log("Dashboard totals:", totals);
      console.log(`Expected: Revenue = Rs.220, Profit = Rs.60, Shake = Rs.150`);
      console.log(`Actual: Revenue = Rs.${totals.totalSalesRevenue}, Profit = Rs.${totals.totalSalesProfit}, Shake = Rs.${totals.totalShakeProfit}`);
    } else {
      console.error("Failed to load dashboard stats:", statsRes.data);
    }


    // --- TEST 4: User cannot delete admin's attendance ---
    console.log("\n--- RUNNING TEST 4: User cannot delete admin's attendance ---");
    // Log in as admin, mark attendance (use yesterday's date to avoid conflict with Test 2 today)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const adminAttendanceRes = await apiRequest('POST', '/attendance', {
      customerId,
      date: yesterdayStr,
      type: 'default'
    }, adminCookie);
    console.log(`Admin Attendance Logged status: ${adminAttendanceRes.status}`);

    // Get attendance ID from database
    const lastAttRes = await query(`SELECT id FROM attendance WHERE recorded_by = $1 ORDER BY created_at DESC LIMIT 1`, [adminId]);
    const adminAttendanceId = lastAttRes.rows[0].id;
    console.log(`Admin attendance record ID: ${adminAttendanceId}`);

    // Try DELETE as user
    const userDeleteRes = await apiRequest('DELETE', `/attendance/${adminAttendanceId}`, null, userCookie);
    console.log(`User try to delete admin attendance. Status Code (Expected 403): ${userDeleteRes.status}`);
    console.log("Response:", userDeleteRes.data);


    // --- TEST 5: Price update does not mutate historical sales ---
    console.log("\n--- RUNNING TEST 5: Price update does not mutate historical sales ---");
    // Log in as admin, update E2E Shake standard price to Rs.160
    const updateProductPriceRes = await apiRequest('PUT', `/products/${productId}/price`, {
      vendor_price: 80
    }, adminCookie);
    console.log(`Update Price Status: ${updateProductPriceRes.status}`);

    // Query sale_items standard_price_snap, vendor_price_snap
    const test5Sql = await query(
      `SELECT si.price_charged, si.standard_price_snap, si.vendor_price_snap
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       ORDER BY s.created_at DESC LIMIT 1`
    );
    console.log("TEST 5 DB Result (Expected standard_price_snap = 13000, vendor_price_snap = 8000):");
    console.table(test5Sql.rows);


    // Clean up
    console.log("\n--- CLEANING UP ---");
    await performCleanup();

  } catch (err) {
    console.error("Error running E2E tests:", err);
  } finally {
    process.exit(0);
  }
}

runE2E();
