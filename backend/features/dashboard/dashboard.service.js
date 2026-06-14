const db = require('../../shared/db/connection');
const audit = require('../../shared/services/auditLogService');
const cache = require('../../shared/services/cacheService');
const queries = require('./dashboard.queries');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/["']/g, "").replace(/\s/g, "") : ""
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
});

const otpCache = new Map();

exports.getStats = async (ownerId, startDate, endDate) => {
    try {
        if (!ownerId) {
            console.error("ownerId is missing in getStats");
            throw new Error("Unauthorized: missing ownerId");
        }

        const periodCacheKey = `dashboard_stats:${ownerId}:${startDate}:${endDate}:period`;
        const pitCacheKey = `dashboard_stats:${ownerId}:PIT`;

    let [cachedPeriod, cachedPit] = await Promise.all([
        cache.getCache(periodCacheKey),
        cache.getCache(pitCacheKey)
    ]);

    const stats = {
        totals: {
            totalSalesProfit: 0,
            totalSalesRevenue: 0,
            totalShakeProfit: 0,
            totalStockVpValue: 0,
            totalStockSellValue: 0,
            lowStockCount: 0,
            topSeller: 'N/A'
        },
        lowStockItems: [],
        monthlyProductSales: [],
        topCustomers: [],
        shakeProfitDetails: [],
        adminConfig: {}
    };

    if (!cachedPit) {
        let confRes = { rows: [] };
        let lowStockThresh = 10;
        try {
            const confQuery = queries.getAdminConfig(ownerId);
            confRes = await db.query(confQuery.text, confQuery.values);
            lowStockThresh = confRes.rows[0]?.low_stock_threshold;
            
            if (lowStockThresh === undefined || lowStockThresh === null) {
                const sysRes = await db.query("SELECT value FROM settings WHERE key = 'SYSTEM_LOW_STOCK_THRESHOLD'");
                lowStockThresh = sysRes.rows.length > 0 ? parseInt(sysRes.rows[0].value) : 10;
            }
        } catch(e) {
            console.error("Stats Generation: Error fetching config. Using defaults.", e.message);
        }

        const pitScalarQuery = queries.getDashboardPitScalars(ownerId);
        const lowStockQuery = queries.getLowStockItems(ownerId);

        let pitScalarRes = { rows: [] }, res4 = { rows: [] };
        try {
            pitScalarRes = await db.query(pitScalarQuery.text, pitScalarQuery.values);
            res4 = await db.query(lowStockQuery.text, lowStockQuery.values);
            
            if (!pitScalarRes.rows[0]) console.warn("Stats Generation: Null aggregations returned for PIT scalars.");
        } catch(e) {
            console.error("Stats Generation: SQL error during PIT queries.", e.message);
        }

        cachedPit = {
            setupCompleted: confRes.rows[0]?.setup_completed || false,
            adminConfig: {
                default_shake_amount: parseInt(confRes.rows[0]?.default_shake_amount || 0) / 100,
                low_stock_threshold: parseInt(lowStockThresh)
            },
            totalStockVpValue: (pitScalarRes.rows[0]?.totalStockVpValue || 0) / 100,
            lowStockCount: parseInt(pitScalarRes.rows[0]?.lowStock || 0),
            lowStockItems: (res4.rows || []).map(r => ({ name: r.product_name, qty: parseInt(r.qty) }))
        };
        await cache.setCache(pitCacheKey, cachedPit, 300); // 5 minutes TTL
    }

    if (!cachedPeriod) {
        const periodScalarQuery = queries.getDashboardPeriodScalars(ownerId, startDate, endDate);
        const monthlySalesQuery = queries.getMonthlyProductSales(ownerId, startDate, endDate);
        const topCustomersQuery = queries.getTopCustomers(ownerId, startDate, endDate);
        const shakeProfitQuery = queries.getShakeProfitDetails(ownerId, startDate, endDate);

        let periodScalarRes = { rows: [] }, res5 = { rows: [] }, res6 = { rows: [] }, res7 = { rows: [] };
        try {
            periodScalarRes = await db.query(periodScalarQuery.text, periodScalarQuery.values);
            res5 = await db.query(monthlySalesQuery.text, monthlySalesQuery.values);
            res6 = await db.query(topCustomersQuery.text, topCustomersQuery.values);
            res7 = await db.query(shakeProfitQuery.text, shakeProfitQuery.values);
            
            if (!periodScalarRes.rows[0]) console.warn("Stats Generation: Null aggregations returned for period scalars.");
        } catch(e) {
            console.error("Stats Generation: SQL error during period queries.", e.message);
        }

        const monthlyProductSales = res5.rows || [];
        cachedPeriod = {
            totalSalesProfit: (periodScalarRes.rows[0]?.totalSalesProfit || 0) / 100,
            totalSalesRevenue: (periodScalarRes.rows[0]?.totalSalesRevenue || 0) / 100,
            totalShakeProfit: (periodScalarRes.rows[0]?.totalShakeProfit || 0) / 100,
            monthlyProductSales: monthlyProductSales,
            topSeller: monthlyProductSales.length > 0 ? monthlyProductSales[0].name : 'N/A',
            topCustomers: (res6.rows || []).map(r => ({ name: r.name, profit: r.profit / 100 })),
            shakeProfitDetails: (res7.rows || []).map(r => ({
                name: r.name,
                attendance: r.attendance,
                profitPerDay: r.profitPerDay / 100,
                totalProfit: r.totalProfit / 100
            }))
        };
        await cache.setCache(periodCacheKey, cachedPeriod, 300); // 5 minutes TTL
    }

    stats.setupCompleted = cachedPit.setupCompleted;
    stats.adminConfig = cachedPit.adminConfig;
    stats.totals.totalStockVpValue = cachedPit.totalStockVpValue;
    stats.totals.lowStockCount = cachedPit.lowStockCount;
    stats.lowStockItems = cachedPit.lowStockItems;

    stats.totals.totalSalesProfit = cachedPeriod.totalSalesProfit;
    stats.totals.totalSalesRevenue = cachedPeriod.totalSalesRevenue;
    stats.totals.totalShakeProfit = cachedPeriod.totalShakeProfit;
    stats.monthlyProductSales = cachedPeriod.monthlyProductSales;
    stats.totals.topSeller = cachedPeriod.topSeller;
    stats.topCustomers = cachedPeriod.topCustomers;
    stats.shakeProfitDetails = cachedPeriod.shakeProfitDetails;

    return { cached: false, data: stats };
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        throw error;
    }
};

exports.resetData = async (ownerId, userId, modules = []) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        // If 'products' is selected, it forces 'sales_and_stock'
        if (modules.includes('products') && !modules.includes('sales_and_stock')) {
            modules.push('sales_and_stock');
        }
        
        if (modules.includes('sales_and_stock')) {
            const activeSalesQuery = queries.getActiveSales(ownerId);
            const activeSalesRes = await client.query(activeSalesQuery.text, activeSalesQuery.values);
            
            for (const row of activeSalesRes.rows) {
                const delQuery = queries.deleteSaleRestoreStock(row.id, userId, ownerId);
                await client.query(delQuery.text, delQuery.values);
            }
            // Wipe physical inventory
            await client.query(`DELETE FROM stock WHERE owner_id = $1`, [ownerId]);
            await client.query(`DELETE FROM stock_entries WHERE owner_id = $1`, [ownerId]);
        }
        
        if (modules.includes('attendance')) {
            const softDelAttQuery = queries.softDeleteAttendance(ownerId);
            await client.query(softDelAttQuery.text, softDelAttQuery.values);
        }
        
        if (modules.includes('products')) {
            // Because sale_items references product_versions and sales, we must delete them first to prevent foreign key errors.
            await client.query(`DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE owner_id = $1)`, [ownerId]);
            await client.query(`DELETE FROM sales WHERE owner_id = $1`, [ownerId]);
            
            await client.query(`DELETE FROM products WHERE owner_id = $1`, [ownerId]);
        }
        
        await client.query('COMMIT');
        
        await audit.logAction(userId, 'DATA_RESET', null, null, { modules });
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.deleteAccount = async (ownerId) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        const deactQuery = queries.deactivateUserAccounts(ownerId);
        await client.query(deactQuery.text, deactQuery.values);
        
        const invSessQuery = queries.invalidateUserSessions(ownerId);
        await client.query(invSessQuery.text, invSessQuery.values);
        
        await client.query('COMMIT');
        await audit.logAction(ownerId, 'ACCOUNT_DELETE');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.completeSetup = async (ownerId) => {
    const query = queries.completeSetup(ownerId);
    await db.query(query.text, query.values);
    await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
};

exports.updateAdminConfig = async (ownerId, default_shake_amount, low_stock_threshold) => {
    let updates = [];
    let values = [];
    let i = 1;

    if (default_shake_amount !== undefined) {
        updates.push(`default_shake_amount = $${i++}`);
        values.push(default_shake_amount * 100);
    }
    if (low_stock_threshold !== undefined) {
        updates.push(`low_stock_threshold = $${i++}`);
        values.push(low_stock_threshold);
    }

    if (updates.length > 0) {
        values.push(ownerId);
        await db.query(`UPDATE admin_config SET ${updates.join(', ')} WHERE owner_id = $${i}`, values);
    }
};

exports.clearAttendanceData = async (ownerId, userId, month) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        let queryStr = `UPDATE attendance SET is_deleted = true, deleted_at = NOW() WHERE owner_id = $1 AND is_deleted = false`;
        const params = [ownerId];
        
        if (month) {
            queryStr += ` AND TO_CHAR(attendance_date, 'YYYY-MM') = $2`;
            params.push(month);
        }
        
        await client.query(queryStr, params);
        await client.query('COMMIT');
        
        await audit.logAction(userId, 'CLEAR_ATTENDANCE', null, null, { month });
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.clearSalesData = async (ownerId, userId, month) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        let queryStr = `SELECT id FROM sales WHERE owner_id = $1 AND is_deleted = false`;
        const params = [ownerId];
        
        if (month) {
            queryStr += ` AND TO_CHAR(sale_date, 'YYYY-MM') = $2`;
            params.push(month);
        }
        
        const salesRes = await client.query(queryStr, params);
        
        for (const row of salesRes.rows) {
            const delQuery = queries.deleteSaleRestoreStock(row.id, userId, ownerId);
            await client.query(delQuery.text, delQuery.values);
        }
        
        await client.query('COMMIT');
        
        await audit.logAction(userId, 'CLEAR_SALES', null, null, { month });
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.requestResetOtp = async (userId, email, password, origin) => {
    if (!password) throw new Error("Password is required");
    
    const userQuery = queries.getUserPasswordHash(userId);
    const userRes = await db.query(userQuery.text, userQuery.values);
    
    if (userRes.rows.length === 0) throw new Error("User not found");
    
    const isMatch = bcrypt.compareSync(password, userRes.rows[0].password_hash);
    if (!isMatch) throw new Error("Incorrect password");
    
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const expiresAtMs = Date.now() + 600000; // 10 minutes
    
    otpCache.set(userId, {
        code: otpCode,
        expiresAt: expiresAtMs
    });
    
    const expiresAtIso = new Date(expiresAtMs).toISOString();
    
    if (process.env.EMAILJS_PUBLIC_KEY) {
        try {
            const emailjsRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: process.env.EMAILJS_SERVICE_ID,
                    template_id: process.env.EMAILJS_TEMPLATE_ID,
                    user_id: process.env.EMAILJS_PUBLIC_KEY,
                    accessToken: process.env.EMAILJS_PRIVATE_KEY,
                    template_params: {
                        to_email: email,
                        subject: 'Data Reset OTP - Life Care System',
                        message: `Your OTP for hard resetting all club data is: ${otpCode}.\n\nThis code will expire in 10 minutes.\nIf you did not request this, please change your password immediately.`
                    }
                })
            });
            
            if (!emailjsRes.ok) {
                const errText = await emailjsRes.text();
                throw new Error(`EmailJS failed: ${errText}`);
            }
            
            return { message: "OTP sent to your email.", expiresAt: expiresAtIso };
        } catch (emailErr) {
            console.error("EmailJS Email failed, falling back to console:", emailErr.message);
            console.log(`[FALLBACK EMAIL] OTP sent to admin: ${otpCode}`);
            return { message: "Email failed to send. Check server console for OTP.", expiresAt: expiresAtIso };
        }
    } else {
        console.log(`[STUB EMAIL] OTP sent to admin: ${otpCode}`);
        return { message: "OTP generated successfully. Check server console.", expiresAt: expiresAtIso };
    }
};

exports.confirmReset = async (ownerId, userId, password, confirmText, otp, modules) => {
    if (!password || !confirmText || !otp) throw new Error("Password, confirmation text, and OTP are required");
    if (confirmText !== 'RESET ALL DATA') throw new Error("Invalid confirmation phrase");
    if (!modules || !Array.isArray(modules) || modules.length === 0) throw new Error("Please select at least one module to reset.");
    
    const userQuery = queries.getUserPasswordHash(userId);
    const userRes = await db.query(userQuery.text, userQuery.values);
    
    if (userRes.rows.length === 0) throw new Error("User not found");
    
    const isMatch = bcrypt.compareSync(password, userRes.rows[0].password_hash);
    if (!isMatch) throw new Error("Incorrect password");
    
    const cached = otpCache.get(userId);
    if (!cached) {
        throw new Error("OTP request not found or has expired. Please request a new one.");
    }
    if (Date.now() > cached.expiresAt) {
        otpCache.delete(userId);
        throw new Error("OTP has expired. Please request a new one.");
    }
    if (cached.code !== otp) {
        throw new Error("Invalid OTP code");
    }
    
    otpCache.delete(userId);
    
    await exports.resetData(ownerId, userId, modules);
};

exports.getDeletedRecords = async (ownerId) => {
    const attQuery = queries.getDeletedAttendance(ownerId);
    const attRes = await db.query(attQuery.text, attQuery.values);
    
    const salesQuery = queries.getDeletedSales(ownerId);
    const salesRes = await db.query(salesQuery.text, salesQuery.values);
    
    const combined = [...attRes.rows, ...salesRes.rows].map(r => ({
        id: r.id,
        type: r.category,
        value: r.value !== null ? parseFloat(r.value) / 100 : 0,
        deletedAt: r.deleted_at,
        date: r.original_date,
        customerName: r.customer_name || 'Unknown Customer'
    }));
    
    combined.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
    return combined;
};

exports.restoreDeletedRecord = async (ownerId, userId, type, id) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        if (type.toLowerCase() === 'attendance') {
            const q = queries.restoreAttendance(id, ownerId);
            await client.query(q.text, q.values);
        } else if (type.toLowerCase() === 'sale') {
            const itemsQ = queries.getSaleItemsForRestore(id);
            const itemsRes = await client.query(itemsQ.text, itemsQ.values);
            
            for (const item of itemsRes.rows) {
                const stockQ = queries.getStockForRestore(item.product_version_id, item.variant_id, ownerId);
                const stockRes = await client.query(stockQ.text, stockQ.values);
                if (stockRes.rows.length === 0 || stockRes.rows[0].quantity < item.quantity) {
                    throw new Error("Insufficient stock to restore this sale.");
                }
            }
            
            for (const item of itemsRes.rows) {
                const deductQ = queries.deductStockForRestore(item.quantity, item.product_version_id, item.variant_id, ownerId);
                await client.query(deductQ.text, deductQ.values);
            }
            const restoreSaleQ = queries.restoreSale(id, ownerId);
            await client.query(restoreSaleQ.text, restoreSaleQ.values);
        } else {
            throw new Error("Invalid record type");
        }
        
        await client.query('COMMIT');
        
        await audit.logAction(userId, 'RECORD_RESTORED', type, id);
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
