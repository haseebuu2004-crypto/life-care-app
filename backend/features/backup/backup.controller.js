const backupService = require('./backup.service');
const cloudStorageService = require('./cloudStorage.service');
const restoreService = require('./restore.service');
const pool = require('../../shared/db/connection');
const queries = require('./backup.queries');

exports.generateBackup = async (req, res) => {
    try {
        const { type, format, uploadToCloud } = req.body;
        const ownerId = req.user.owner_id || req.user.id;
        
        const q = queries.getClubName(ownerId);
        const adminConfigRes = await pool.query(q.text, q.values);
        const clubName = adminConfigRes.rows[0]?.club_name || '';
        
        if (!['customers', 'sales', 'attendance', 'products', 'full'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid backup type' });
        }
        if (!['csv', 'xlsx'].includes(format)) {
            return res.status(400).json({ success: false, message: 'Invalid format' });
        }

        const data = await backupService.getExportData(type, ownerId);
        let buffer;
        let mimeType = format === 'xlsx' 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv';

        if (format === 'xlsx') {
            buffer = await backupService.generateExcel(data, type, ownerId);
        } else {
            const csvStr = await backupService.generateCSV(data, type, ownerId);
            buffer = Buffer.from(csvStr, 'utf-8');
        }

        const fileName = backupService.generateFileName(type, format, clubName);

        if (uploadToCloud) {
            if (!cloudStorageService.isConfigured()) {
                return res.status(500).json({ success: false, message: 'Cloud storage is not configured.' });
            }
            const fileUrl = await cloudStorageService.uploadBackup(buffer, fileName, mimeType);
            
            const logQ = queries.insertBackupLogCloud(ownerId, type, fileName, fileUrl, buffer.length, req.user?.username || 'Admin', 'Manual Cloud Backup');
            await pool.query(logQ.text, logQ.values);
            
            return res.json({ success: true, data: { url: fileUrl, message: 'Backup successfully uploaded to cloud' } });
        } else {
            const logQ = queries.insertBackupLogLocal(ownerId, type, fileName, buffer.length, req.user?.username || 'Admin', 'Manual Download');
            await pool.query(logQ.text, logQ.values);

            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Type', mimeType);
            return res.send(buffer);
        }
    } catch (error) {
        console.error('Backup generation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBackupLogs = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const q = queries.getBackupLogs(ownerId);
        const { rows } = await pool.query(q.text, q.values);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.validateRestore = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        
        const ownerId = req.user.owner_id || req.user.id;
        const parsed = await restoreService.parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
        const validation = await restoreService.validateRestore(parsed, ownerId);
        
        res.json({ 
            success: true, 
            data: { 
                type: parsed.type,
                message: validation.message, 
                isValid: validation.valid 
            } 
        });
    } catch (error) {
        console.error('Restore Validation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.confirmRestore = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        
        const { strategy } = req.body; // 'merge' or 'wipe'
        const ownerId = req.user.owner_id || req.user.id;

        // Daily limit check
        const q = queries.getRestoreLimitCount(ownerId);
        const countRes = await pool.query(q.text, q.values);
        
        if (parseInt(countRes.rows[0].count) >= 3) {
            return res.status(429).json({ success: false, message: "Daily restoration limit reached (maximum 3 restores per day)." });
        }

        const parsed = await restoreService.parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
        const validation = await restoreService.validateRestore(parsed, ownerId);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.message });
        }

        const result = await restoreService.executeRestore(ownerId, parsed.type, parsed, strategy);
        
        // Log restore success
        const logQ = queries.logRestoreSuccess(ownerId, parsed.type, req.file.originalname, req.user?.username || 'Admin', strategy);
        await pool.query(logQ.text, logQ.values);

        // Invalidate dashboard cache so stock/sales reflect the restore immediately
        const cache = require('../../shared/services/cacheService');
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Restore Confirmation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
