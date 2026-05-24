const backupService = require('../services/backupService');
const cloudStorageService = require('../services/cloudStorageService');
const restoreService = require('../services/restoreService');
const pool = require('../config/db');
const { getOwnerId } = require('../middleware/authMiddleware');

exports.generateBackup = async (req, res) => {
    try {
        const { type, format, uploadToCloud } = req.body;
        const ownerId = getOwnerId(req);
        
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
            buffer = await backupService.generateExcel(data, type);
        } else {
            const csvStr = await backupService.generateCSV(data, type);
            buffer = Buffer.from(csvStr, 'utf-8');
        }

        const fileName = backupService.generateFileName(type, format);

        if (uploadToCloud) {
            if (!cloudStorageService.isConfigured()) {
                return res.status(500).json({ success: false, message: 'Cloud storage is not configured.' });
            }
            const fileUrl = await cloudStorageService.uploadBackup(buffer, fileName, mimeType);
            
            await pool.query(`
                INSERT INTO backup_logs 
                (owner_id, backup_type, file_name, storage_provider, file_url, file_size, status, created_by, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [ownerId, type, fileName, 'GoogleDrive', fileUrl, buffer.length, 'Success', req.user?.username || 'Admin', 'Manual Cloud Backup']);
            
            return res.json({ success: true, data: { url: fileUrl, message: 'Backup successfully uploaded to cloud' } });
        } else {
            await pool.query(`
                INSERT INTO backup_logs 
                (owner_id, backup_type, file_name, storage_provider, file_size, status, created_by, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [ownerId, type, fileName, 'Local Download', buffer.length, 'Success', req.user?.username || 'Admin', 'Manual Download']);

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
        const ownerId = getOwnerId(req);
        const { rows } = await pool.query('SELECT * FROM backup_logs WHERE owner_id = $1 ORDER BY created_at DESC LIMIT 50', [ownerId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.validateRestore = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        
        const parsed = await restoreService.parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
        const validation = await restoreService.validateRestore(parsed.data, parsed.type);
        
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
        const ownerId = getOwnerId(req);

        const parsed = await restoreService.parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
        const result = await restoreService.executeRestore(ownerId, parsed.type, parsed.data, strategy);
        
        // Log restore success
        await pool.query(`
            INSERT INTO backup_logs 
            (owner_id, backup_type, file_name, storage_provider, status, created_by, restore_status, restore_at, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        `, [ownerId, parsed.type, req.file.originalname, 'Upload', 'Success', req.user?.username || 'Admin', 'Restored', `Restore Strategy: ${strategy}`]);

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Restore Confirmation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
