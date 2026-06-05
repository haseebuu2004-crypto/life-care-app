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
        pass: process.env.SMTP_PASS
    }
});

const otpCache = new Map();

exports.getStats = async (ownerId, startDate, endDate) => {
    const cacheKey = `dashboard_stats:${ownerId}:${startDate}:${endDate}`;
    const cachedData = await cache.getCache(cacheKey);
    
    if (cachedData) {
        return { cached: true, data: cachedData };
    }

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

    const confQuery = queries.getAdminConfig(ownerId);
    const confRes = await db.query(confQuery.text, confQuery.values);
    const lowStockThresh = confRes.rows[0]?.low_stock_threshold || 10;
    stats.setupCompleted = confRes.rows[0]?.setup_completed || false;
    stats.adminConfig = {
        default_shake_amount: parseInt(confRes.rows[0]?.default_shake_amount || 0) / 100,
        low_stock_threshold: parseInt(lowStockThresh)
    };

    const scalarQuery = queries.getDashboardScalars(ownerId, lowStockThresh, startDate, endDate);
    const lowStockQuery = queries.getLowStockItems(ownerId, lowStockThresh);
    const monthlySalesQuery = queries.getMonthlyProductSales(ownerId, startDate, endDate);
    const topCustomersQuery = queries.getTopCustomers(ownerId, startDate, endDate);
    const shakeProfitQuery = queries.getShakeProfitDetails(ownerId, startDate, endDate);

    const [scalarRes, res4, res5, res6, res7] = await Promise.all([
        db.query(scalarQuery.text, scalarQuery.values),
        db.query(lowStockQuery.text, lowStockQuery.values),
        db.query(monthlySalesQuery.text, monthlySalesQuery.values),
        db.query(topCustomersQuery.text, topCustomersQuery.values),
        db.query(shakeProfitQuery.text, shakeProfitQuery.values)
    ]);

    stats.totals.totalSalesProfit = (scalarRes.rows[0]?.totalSalesProfit || 0) / 100;
    stats.totals.totalSalesRevenue = (scalarRes.rows[0]?.totalSalesRevenue || 0) / 100;
    stats.totals.totalStockVpValue = (scalarRes.rows[0]?.totalStockVpValue || 0) / 100;
    stats.totals.totalShakeProfit = (scalarRes.rows[0]?.totalShakeProfit || 0) / 100;
    stats.totals.lowStockCount = parseInt(scalarRes.rows[0]?.lowStock || 0);

    stats.lowStockItems = (res4.rows || []).map(r => ({ name: r.product_name, qty: parseInt(r.qty) }));

    stats.monthlyProductSales = res5.rows || [];
    if (stats.monthlyProductSales.length > 0) stats.totals.topSeller = stats.monthlyProductSales[0].name;

    stats.topCustomers = (res6.rows || []).map(r => ({ name: r.name, profit: r.profit / 100 }));

    stats.shakeProfitDetails = (res7.rows || []).map(r => ({
        name: r.name,
        attendance: r.attendance,
        profitPerDay: r.profitPerDay / 100,
        totalProfit: r.totalProfit / 100
    }));

    await cache.setCache(cacheKey, stats, 300); // 5 minutes TTL
    return { cached: false, data: stats };
};

exports.resetData = async (ownerId, userId) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        const activeSalesQuery = queries.getActiveSales(ownerId);
        const activeSalesRes = await client.query(activeSalesQuery.text, activeSalesQuery.values);
        
        for (const row of activeSalesRes.rows) {
            const delQuery = queries.deleteSaleRestoreStock(row.id, userId, ownerId);
            await client.query(delQuery.text, delQuery.values);
        }
        
        const softDelAttQuery = queries.softDeleteAttendance(ownerId);
        await client.query(softDelAttQuery.text, softDelAttQuery.values);
        
        await client.query('COMMIT');
        
        await audit.logAction(userId, 'DATA_RESET', null, null);
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

exports.requestResetOtp = async (userId, email, password) => {
    if (!password) throw new Error("Password is required");
    
    const userQuery = queries.getUserPasswordHash(userId);
    const userRes = await db.query(userQuery.text, userQuery.values);
    
    if (userRes.rows.length === 0) throw new Error("User not found");
    
    const isMatch = bcrypt.compareSync(password, userRes.rows[0].password_hash);
    if (!isMatch) throw new Error("Incorrect password");
    
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    otpCache.set(userId, {
        code: otpCode,
        expiresAt: Date.now() + 600000 // 10 minutes
    });
    
    if (process.env.SMTP_USER) {
        try {
            await transporter.sendMail({
                from: '"Life Care System" <noreply@lifecare.com>',
                to: email,
                subject: 'Data Reset OTP - Life Care System',
                text: `Your OTP for hard resetting all club data is: ${otpCode}.\n\nThis code will expire in 10 minutes.\nIf you did not request this, please change your password immediately.`
            });
            return "OTP sent to your email.";
        } catch (emailErr) {
            console.error("SMTP Email failed, falling back to console:", emailErr.message);
            console.log(`[FALLBACK EMAIL] OTP sent to admin: ${otpCode}`);
            return "Email failed to send. Check server console for OTP.";
        }
    } else {
        console.log(`[STUB EMAIL] OTP sent to admin: ${otpCode}`);
        return "OTP generated successfully. Check server console.";
    }
};

exports.confirmReset = async (ownerId, userId, password, confirmText, otp) => {
    if (!password || !confirmText || !otp) throw new Error("Password, confirmation text, and OTP are required");
    if (confirmText !== 'RESET ALL DATA') throw new Error("Invalid confirmation phrase");
    
    const userQuery = queries.getUserPasswordHash(userId);
    const userRes = await db.query(userQuery.text, userQuery.values);
    
    if (userRes.rows.length === 0) throw new Error("User not found");
    
    const isMatch = bcrypt.compareSync(password, userRes.rows[0].password_hash);
    if (!isMatch) throw new Error("Incorrect password");
    
    const cached = otpCache.get(userId);
    if (!cached || cached.code !== otp || Date.now() > cached.expiresAt) {
        throw new Error("Invalid or expired OTP");
    }
    
    otpCache.delete(userId);
    
    await exports.resetData(ownerId, userId);
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
                const stockQ = queries.getStockForRestore(item.product_version_id, ownerId);
                const stockRes = await client.query(stockQ.text, stockQ.values);
                if (stockRes.rows.length === 0 || stockRes.rows[0].quantity < item.quantity) {
                    throw new Error("Insufficient stock to restore this sale.");
                }
            }
            
            for (const item of itemsRes.rows) {
                const deductQ = queries.deductStockForRestore(item.quantity, item.product_version_id, ownerId);
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
