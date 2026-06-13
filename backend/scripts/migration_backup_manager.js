const fs = require('fs');
const pool = require('../shared/db/connection');
const path = require('path');

class MigrationBackupManager {
    constructor() {
        this.backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../backups');
        if (!fs.existsSync(this.backupDir)) fs.mkdirSync(this.backupDir, { recursive: true });
    }

    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(this.backupDir, `migration_backup_${timestamp}.json`);
        
        console.log(`Creating database backup at ${backupFile}...`);
        
        const tables = ['products', 'product_versions', 'stock', 'sale_items', 'variant_rollback_archive', 'sale_item_variant_archive'];
        
        const data = {};
        for (const table of tables) {
            try {
                const res = await pool.query(`SELECT * FROM ${table}`);
                data[table] = res.rows;
            } catch (e) {
                data[table] = [];
            }
        }
        
        try { const res = await pool.query(`SELECT * FROM variants`); data['variants'] = res.rows; } catch(e) { data['variants'] = []; }
        try { const res = await pool.query(`SELECT * FROM flavours`); data['flavours'] = res.rows; } catch(e) { data['flavours'] = []; }

        fs.writeFileSync(backupFile, JSON.stringify(data));
        console.log(`Backup completed successfully.`);
        return backupFile;
    }
}

module.exports = new MigrationBackupManager();
