const db = require('../db');
const audit = require('../services/auditLogService');
const cache = require('../services/cacheService');
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

exports.getStats = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        
        let { startDate, endDate } = req.query;
        
        const now = new Date();
        if (!startDate) {
            // Default to current calendar month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        }
        if (!endDate) {
            endDate = now.toISOString().split('T')[0];
        }

        const cacheKey = `dashboard_stats:${ownerId}:${startDate}:${endDate}`;
        const cachedData = await cache.getCache(cacheKey);
        
        if (cachedData) {
            return res.json({ success: true, data: cachedData, cached: true });
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

        // Fetch config
        const confRes = await db.query(`SELECT low_stock_threshold, setup_completed, default_shake_amount FROM admin_config WHERE owner_id = $1`, [ownerId]);
        const lowStockThresh = confRes.rows[0]?.low_stock_threshold || 10;
        stats.setupCompleted = confRes.rows[0]?.setup_completed || false;
        stats.adminConfig = {
            default_shake_amount: parseInt(confRes.rows[0]?.default_shake_amount || 0) / 100,
            low_stock_threshold: parseInt(lowStockThresh)
        };

        // Combine scalar queries
        const scalarQuery = `
            SELECT 
                (SELECT COALESCE(SUM((si.price_charged - si.vendor_price_snap) * si.quantity), 0) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.owner_id = $1 AND s.sale_date >= $3 AND s.sale_date <= $4 AND s.is_deleted = false) as "totalSalesProfit",
                (SELECT COALESCE(SUM(si.price_charged * si.quantity), 0) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.owner_id = $1 AND s.sale_date >= $3 AND s.sale_date <= $4 AND s.is_deleted = false) as "totalSalesRevenue",
                (SELECT COALESCE(SUM(s.quantity * s.vendor_price_snap), 0) FROM stock s JOIN product_versions pv ON s.product_version_id = pv.id WHERE s.owner_id = $1 AND pv.is_active = true) as "totalStockVpValue",
                (SELECT COALESCE(SUM(shake_amount), 0) FROM attendance WHERE owner_id = $1 AND attendance_date >= $3 AND attendance_date <= $4 AND is_deleted = false) as "totalShakeProfit",
                (SELECT COUNT(*) FROM stock s JOIN product_versions pv ON s.product_version_id = pv.id WHERE s.owner_id = $1 AND s.quantity <= $2 AND pv.is_active = true) as "lowStock"
        `;

        const [scalarRes, res4, res5, res6, res7] = await Promise.all([
            db.query(scalarQuery, [ownerId, lowStockThresh, startDate, endDate]),
            db.query(`
                SELECT s.id, p.name as product_name, s.quantity as qty
                FROM stock s
                JOIN product_versions pv ON s.product_version_id = pv.id
                JOIN products p ON pv.product_id = p.id
                WHERE s.quantity <= $2 AND s.owner_id = $1 AND pv.is_active = true
                ORDER BY s.quantity ASC
            `, [ownerId, lowStockThresh]),
            db.query(`
                SELECT p.name, SUM(si.quantity) as qty
                FROM sale_items si
                JOIN sales s ON si.sale_id = s.id
                JOIN product_versions pv ON si.product_version_id = pv.id
                JOIN products p ON pv.product_id = p.id
                WHERE s.sale_date >= $1 AND s.sale_date <= $3 AND s.owner_id = $2 AND s.is_deleted = false
                GROUP BY p.name
                ORDER BY qty DESC
            `, [startDate, ownerId, endDate]),
            db.query(`
                SELECT c.name, COALESCE(SUM((si.price_charged - si.vendor_price_snap) * si.quantity), 0) as profit
                FROM sale_items si
                JOIN sales s ON si.sale_id = s.id
                JOIN customers c ON s.customer_id = c.id
                WHERE s.owner_id = $1 AND s.sale_date >= $2 AND s.sale_date <= $3 AND s.is_deleted = false
                GROUP BY c.name
                ORDER BY profit DESC
                LIMIT 10
            `, [ownerId, startDate, endDate]),
            db.query(`
                SELECT c.name, COUNT(*) as attendance, AVG(a.shake_amount) as "profitPerDay", SUM(a.shake_amount) as "totalProfit"
                FROM attendance a
                JOIN customers c ON a.customer_id = c.id
                WHERE a.owner_id = $1 AND a.attendance_date >= $2 AND a.attendance_date <= $3 AND a.is_deleted = false
                GROUP BY c.name
                ORDER BY "totalProfit" DESC
            `, [ownerId, startDate, endDate])
        ]);

        stats.totals.totalSalesProfit = (scalarRes.rows[0]?.totalSalesProfit || 0) / 100;
        stats.totals.totalSalesRevenue = (scalarRes.rows[0]?.totalSalesRevenue || 0) / 100;
        stats.totals.totalStockVpValue = (scalarRes.rows[0]?.totalStockVpValue || 0) / 100;
        stats.totals.totalShakeProfit = (scalarRes.rows[0]?.totalShakeProfit || 0) / 100;
        stats.totals.lowStockCount = parseInt(scalarRes.rows[0]?.lowStock || 0);

        stats.lowStockItems = (res4.rows || []).map(r => ({ name: r.product_name, qty: parseInt(r.qty) }));

        stats.monthlyProductSales = res5.rows || [];
        if (stats.monthlyProductSales.length > 0) stats.totals.topSeller = stats.monthlyProductSales[0].name;

        // Convert PAISE to Rupee for customers and attendance
        stats.topCustomers = (res6.rows || []).map(r => ({ name: r.name, profit: r.profit / 100 }));

        stats.shakeProfitDetails = (res7.rows || []).map(r => ({
            name: r.name,
            attendance: r.attendance,
            profitPerDay: r.profitPerDay / 100,
            totalProfit: r.totalProfit / 100
        }));

        await cache.setCache(cacheKey, stats, 300); // 5 minutes TTL
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.resetData = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            // Fetch all active sales to restore stock atomically
            const activeSalesRes = await client.query(`SELECT id FROM sales WHERE owner_id = $1 AND is_deleted = false`, [ownerId]);
            for (const row of activeSalesRes.rows) {
                await client.query(`SELECT delete_sale_restore_stock($1, $2, $3)`, [row.id, req.user.id, ownerId]);
            }
            
            // Soft delete attendance
            await client.query(`UPDATE attendance SET is_deleted = true, deleted_at = NOW() WHERE owner_id = $1`, [ownerId]);
            
            await client.query('COMMIT');
            client.release();

            await audit.logAction(req.user.id, 'DATA_RESET', null, null);
            await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
            
            res.json({ success: true, message: "Sales and Attendance data reset successfully (Stock restored)" });
        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            console.error("Reset Error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    } catch (error) {
        console.error("Reset Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        if (req.user.id !== (req.user.owner_id || req.user.id)) {
            return res.status(403).json({ success: false, message: "Only the primary account holder can delete the account." });
        }
        const ownerId = req.user.id;
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`UPDATE users SET is_active = false WHERE id = $1 OR owner_id = $1`, [ownerId]);
            await client.query(`UPDATE sessions SET invalidated_at = NOW() WHERE user_id IN (SELECT id FROM users WHERE id = $1 OR owner_id = $1)`, [ownerId]);
            await client.query('COMMIT');
            client.release();
            
            await audit.logAction(ownerId, 'ACCOUNT_DELETE');
            
            res.clearCookie('session_token');
            res.json({ success: true, message: "Account deleted." });
        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            console.error("Delete Account Error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    } catch (error) {
        console.error("Delete Account Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.completeSetup = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        await db.query(`UPDATE admin_config SET setup_completed = true WHERE owner_id = $1`, [ownerId]);
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
        res.json({ success: true, message: "Setup wizard completed" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateAdminConfig = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { default_shake_amount, low_stock_threshold } = req.body;
        
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
        
        res.json({ success: true, message: "Config updated successfully" });
    } catch (error) {
        console.error("Config Update Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.clearAttendanceData = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { month } = req.body; // format 'YYYY-MM' or null
        
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            let query = `UPDATE attendance SET is_deleted = true, deleted_at = NOW() WHERE owner_id = $1 AND is_deleted = false`;
            const params = [ownerId];
            
            if (month) {
                query += ` AND TO_CHAR(attendance_date, 'YYYY-MM') = $2`;
                params.push(month);
            }
            
            await client.query(query, params);
            
            await client.query('COMMIT');
            client.release();
            
            await audit.logAction(req.user.id, 'CLEAR_ATTENDANCE', null, null, { month });
            await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
            
            res.json({ 
                success: true, 
                message: `Attendance data cleared successfully${month ? ` for ${month}` : ''}.` 
            });
        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            console.error("Clear Attendance Error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    } catch (error) {
        console.error("Clear Attendance Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.clearSalesData = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { month } = req.body; // format 'YYYY-MM' or null
        
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            let query = `SELECT id FROM sales WHERE owner_id = $1 AND is_deleted = false`;
            const params = [ownerId];
            
            if (month) {
                query += ` AND TO_CHAR(sale_date, 'YYYY-MM') = $2`;
                params.push(month);
            }
            
            const salesRes = await client.query(query, params);
            
            for (const row of salesRes.rows) {
                await client.query(`SELECT delete_sale_restore_stock($1, $2, $3)`, [row.id, req.user.id, ownerId]);
            }
            
            await client.query('COMMIT');
            client.release();
            
            await audit.logAction(req.user.id, 'CLEAR_SALES', null, null, { month });
            await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
            
            res.json({ 
                success: true, 
                message: `Sales data cleared successfully${month ? ` for ${month}` : ''}. Stock has been restored.` 
            });
        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            console.error("Clear Sales Error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    } catch (error) {
        console.error("Clear Sales Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.requestResetOtp = async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }
        
        const userRes = await db.query(`SELECT password_hash FROM users WHERE id = $1`, [req.user.id]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        const isMatch = bcrypt.compareSync(password, userRes.rows[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }
        
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        otpCache.set(req.user.id, {
            code: otpCode,
            expiresAt: Date.now() + 600000 // 10 minutes
        });
        
        // Send email via SMTP or fallback to console
        if (process.env.SMTP_USER) {
            try {
                await transporter.sendMail({
                    from: '"Life Care System" <noreply@lifecare.com>',
                    to: req.user.email,
                    subject: 'Data Reset OTP - Life Care System',
                    text: `Your OTP for hard resetting all club data is: ${otpCode}.\n\nThis code will expire in 10 minutes.\nIf you did not request this, please change your password immediately.`
                });
                return res.json({ success: true, message: "OTP sent to your email." });
            } catch (emailErr) {
                console.error("SMTP Email failed, falling back to console:", emailErr.message);
                console.log(`[FALLBACK EMAIL] OTP sent to admin: ${otpCode}`);
                return res.json({ success: true, message: "Email failed to send. Check server console for OTP." });
            }
        } else {
            console.log(`[STUB EMAIL] OTP sent to admin: ${otpCode}`);
            return res.json({ success: true, message: "OTP generated successfully. Check server console." });
        }
    } catch (error) {
        console.error("Request OTP error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.confirmReset = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { password, confirmText, otp } = req.body;
        
        if (!password || !confirmText || !otp) {
            return res.status(400).json({ success: false, message: "Password, confirmation text, and OTP are required" });
        }
        
        if (confirmText !== 'RESET ALL DATA') {
            return res.status(400).json({ success: false, message: "Invalid confirmation phrase" });
        }
        
        // Verify password
        const userRes = await db.query(`SELECT password_hash FROM users WHERE id = $1`, [req.user.id]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const isMatch = bcrypt.compareSync(password, userRes.rows[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }
        
        // Verify OTP
        const cached = otpCache.get(req.user.id);
        if (!cached || cached.code !== otp || Date.now() > cached.expiresAt) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }
        
        // Delete OTP from cache
        otpCache.delete(req.user.id);
        
        // Perform reset
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            // Fetch all active sales to restore stock atomically
            const activeSalesRes = await client.query(`SELECT id FROM sales WHERE owner_id = $1 AND is_deleted = false`, [ownerId]);
            for (const row of activeSalesRes.rows) {
                await client.query(`SELECT delete_sale_restore_stock($1, $2, $3)`, [row.id, req.user.id, ownerId]);
            }
            
            // Soft delete attendance
            await client.query(`UPDATE attendance SET is_deleted = true, deleted_at = NOW() WHERE owner_id = $1`, [ownerId]);
            
            await client.query('COMMIT');
            client.release();

            await audit.logAction(req.user.id, 'DATA_RESET', null, null);
            await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
            
            res.json({ success: true, message: "System reset successful. All sales and attendance cleared, stock restored." });
        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            console.error("Confirm Reset error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    } catch (error) {
        console.error("Confirm Reset error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getDeletedRecords = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        
        // Fetch deleted attendance
        const attRes = await db.query(`
            SELECT a.id, 'Attendance' as category, a.shake_amount as value, a.deleted_at, a.attendance_date as original_date, c.name as customer_name
            FROM attendance a
            LEFT JOIN customers c ON a.customer_id = c.id
            WHERE a.owner_id = $1 AND a.is_deleted = true
        `, [ownerId]);
        
        // Fetch deleted sales
        const salesRes = await db.query(`
            SELECT 
                s.id, 
                'Sale' as category, 
                (SELECT COALESCE(SUM((si.price_charged - si.vendor_price_snap) * si.quantity), 0) FROM sale_items si WHERE si.sale_id = s.id) as value, 
                s.deleted_at, 
                s.sale_date as original_date, 
                c.name as customer_name
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            WHERE s.owner_id = $1 AND s.is_deleted = true
        `, [ownerId]);
        
        const combined = [...attRes.rows, ...salesRes.rows].map(r => ({
            id: r.id,
            type: r.category,
            value: r.value !== null ? parseFloat(r.value) / 100 : 0, // Convert cents to standard currency
            deletedAt: r.deleted_at,
            date: r.original_date,
            customerName: r.customer_name || 'Unknown Customer'
        }));
        
        // Sort by deletedAt desc
        combined.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
        
        res.json({ success: true, data: combined });
    } catch (error) {
        console.error("Get Deleted Records error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.restoreDeletedRecord = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { type, id } = req.params; // type is 'sale' or 'attendance'
        
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            if (type.toLowerCase() === 'attendance') {
                await client.query(`UPDATE attendance SET is_deleted = false, deleted_at = null WHERE id = $1 AND owner_id = $2`, [id, ownerId]);
            } else if (type.toLowerCase() === 'sale') {
                // Check for sufficient stock before restoring
                const itemsRes = await client.query(`SELECT product_version_id, quantity FROM sale_items WHERE sale_id = $1`, [id]);
                
                for (const item of itemsRes.rows) {
                    const stockRes = await client.query(`SELECT quantity FROM stock WHERE product_version_id = $1 AND owner_id = $2`, [item.product_version_id, ownerId]);
                    if (stockRes.rows.length === 0 || stockRes.rows[0].quantity < item.quantity) {
                        throw new Error("Insufficient stock to restore this sale.");
                    }
                }
                
                // Deduct stock safely
                for (const item of itemsRes.rows) {
                    await client.query(`UPDATE stock SET quantity = quantity - $1 WHERE product_version_id = $2 AND owner_id = $3`, [item.quantity, item.product_version_id, ownerId]);
                }
                await client.query(`UPDATE sales SET is_deleted = false, deleted_at = null WHERE id = $1 AND owner_id = $2`, [id, ownerId]);
            } else {
                throw new Error("Invalid record type");
            }
            
            await client.query('COMMIT');
            
            await audit.logAction(req.user.id, 'RECORD_RESTORED', type, id);
            await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
            
            res.json({ success: true, message: "Record restored successfully." });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Restore Deleted Record error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
