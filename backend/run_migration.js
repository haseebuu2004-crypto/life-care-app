require('dotenv').config({path: './.env'});
const fs = require('fs');
const pool = require('./shared/db/connection');
const backupManager = require('./scripts/migration_backup_manager');
const auditor = require('./scripts/audit_evidence_generator');

async function run() {
    console.log("Starting migration process...");
    let backupFile;
    try {
        backupFile = await backupManager.createBackup();
    } catch (e) {
        console.error("ABORTING: Backup failed.", e);
        process.exit(1);
    }

    const sql = fs.readFileSync('migrate_variants_safe.sql', 'utf8');
    const client = await pool.pool.connect();
    
    try {
        const preStockRes = await client.query('SELECT sum(quantity) as sum FROM stock');
        const preStock = parseInt(preStockRes.rows[0].sum) || 0;

        console.log("Executing SQL...");
        await client.query(sql);

        const postStockRes = await client.query('SELECT sum(quantity) as sum FROM stock');
        const postStock = parseInt(postStockRes.rows[0].sum) || 0;

        const report = {
            status: 'PASS',
            type: 'MIGRATION',
            stockBefore: preStock,
            stockAfter: postStock,
            backupFile
        };
        
        auditor.generate(report, 'migration_report');
        console.log("Migration completed successfully.");
    } catch (e) {
        console.error("Migration failed!", e);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
}
run();
