const reportsService = require('./reports.service');
const audit = require('../../services/auditLogService');

exports.exportData = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const type = req.query.type || 'summary';
        const range = req.query.range || 'all';

        if (type === 'full_backup') {
            const { buffer, filename, contentType } = await reportsService.exportExcel(ownerId);
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
            await audit.logAction(req.user.id, 'EXPORT_EXCEL', 'full_backup', null);
            return;
        }

        const { buffer, filename, contentType } = await reportsService.exportPDF(ownerId, type, range);
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', contentType);
        res.send(buffer);
        await audit.logAction(req.user.id, 'EXPORT_PDF', type, null);
    } catch (e) {
        console.error("Export Error:", e);
        if (!res.headersSent) res.status(500).json({ success: false, message: "Export failed" });
    }
};

exports.importCSV = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { type } = req.body; // 'customers', 'products'
        
        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
        if (!['customers', 'products'].includes(type)) return res.status(400).json({ success: false, message: "Invalid type" });

        const result = await reportsService.importCSV(ownerId, req.user.id, type, req.file.buffer);
        
        await audit.logAction(req.user.id, 'IMPORT_CSV', type, null);
        
        if (type === 'customers' && result.missingIdCount > 0) {
            return res.json({
                success: true,
                imported: result.importedCount,
                warning: `${result.missingIdCount} customers were imported without an ID. Check the Members section for potential duplicates.`
            });
        }

        res.json({ success: true, imported: result.importedCount, message: `Bulk import for ${type} successful.` });
    } catch (e) {
        console.error("CSV Import Error:", e);
        res.status(500).json({ success: false, message: e.message || "Import failed. Transaction rolled back." });
    }
};

exports.ping = (req, res) => {
    res.json({ success: true });
};
