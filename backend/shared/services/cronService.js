const cron = require('node-cron');
const pool = require('../../config/db');
const backupService = require('../../features/backup/backup.service');
const cloudStorageService = require('../../features/backup/cloudStorage.service');

class CronService {
    init() {
        if (!cloudStorageService.isConfigured()) {
            console.warn('CronService: Google Drive is not configured. Automated backups will not be scheduled.');
            return;
        }

        // Customer backup -> daily (Midnight)
        cron.schedule('0 0 * * *', () => this.runScheduledBackup('customers'), { scheduled: true });
        
        // Sales backup -> every 6 hours
        cron.schedule('0 */6 * * *', () => this.runScheduledBackup('sales'), { scheduled: true });
        
        // Full backup -> weekly (Sunday at 2 AM)
        cron.schedule('0 2 * * 0', () => this.runScheduledBackup('full'), { scheduled: true });

        console.log('CronService: Automated backup schedules initialized.');
    }

    async runScheduledBackup(type) {
        console.log(`CronService: Starting automated ${type} backup...`);
        try {
            // Get all unique owner_ids to backup each tenant
            const { rows: admins } = await pool.query("SELECT id, username FROM users WHERE role = 'admin'");
            
            for (const admin of admins) {
                const ownerId = admin.id.toString();
                console.log(`CronService: Backing up ${type} for workspace ${ownerId}`);
                
                try {
                    const data = await backupService.getExportData(type, ownerId);
                    
                    let buffer;
                    let format = type === 'full' ? 'xlsx' : 'csv';
                    let mimeType = format === 'xlsx' 
                        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        : 'text/csv';

                    if (format === 'xlsx') {
                        buffer = await backupService.generateExcel(data, type);
                    } else {
                        const csvStr = await backupService.generateCSV(data, type);
                        if (!csvStr) continue; // Nothing to backup
                        buffer = Buffer.from(csvStr, 'utf-8');
                    }

                    const fileName = `AUTO_${admin.username}_${backupService.generateFileName(type, format)}`;
                    
                    const fileUrl = await cloudStorageService.uploadBackup(buffer, fileName, mimeType);

                    // Log success
                    await pool.query(`
                        INSERT INTO backup_logs 
                        (owner_id, backup_type, file_name, storage_provider, file_url, file_size, status, created_by, notes)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    `, [ownerId, type, fileName, 'GoogleDrive', fileUrl, buffer.length, 'Success', 'SYSTEM', 'Automated Cron Backup']);
                    
                } catch (tenantErr) {
                    console.error(`CronService: Failed backup for tenant ${ownerId}:`, tenantErr);
                    // Log failure
                    await pool.query(`
                        INSERT INTO backup_logs 
                        (owner_id, backup_type, file_name, storage_provider, status, created_by, notes)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [ownerId, type, `AUTO_${type}_FAILED`, 'GoogleDrive', 'Failed', 'SYSTEM', tenantErr.message]);
                }
            }
        } catch (err) {
            console.error(`CronService: Critical error during scheduled ${type} backup:`, err);
        }
    }
}

module.exports = new CronService();
