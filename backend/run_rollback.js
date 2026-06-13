require('dotenv').config({path: './.env'});
const fs = require('fs');
const pool = require('./shared/db/connection');
const backupManager = require('./scripts/migration_backup_manager');
const auditor = require('./scripts/audit_evidence_generator');
const validator = require('./scripts/migration_validator');

async function run() {
    console.log("Starting rollback process...");
    
    const isValid = await validator.validate();
    if (!isValid) {
        console.error("ABORTING: Pre-flight validation failed.");
        process.exit(1);
    }

    let backupFile;
    try {
        backupFile = await backupManager.createBackup();
    } catch (e) {
        console.error("ABORTING: Backup failed.", e);
        process.exit(1);
    }

    const sql = fs.readFileSync('rollback_variants_safe.sql', 'utf8');
    const client = await pool.pool.connect();
    
    try {
        const preStockRes = await client.query('SELECT sum(quantity) as sum FROM stock');
        const preStock = parseInt(preStockRes.rows[0].sum) || 0;
        
        let preSkuCount = 0;
        try {
            const skuRes = await client.query('SELECT count(sku) as count FROM variants WHERE sku IS NOT NULL');
            preSkuCount = parseInt(skuRes.rows[0].count) || 0;
        } catch(e) {}

        console.log("Executing SQL rollback...");
        await client.query(sql);

        const postStockRes = await client.query('SELECT sum(quantity) as sum FROM stock');
        const postStock = parseInt(postStockRes.rows[0].sum) || 0;
        
        const archiveSkuRes = await client.query('SELECT count(sku) as count FROM variant_rollback_archive WHERE sku IS NOT NULL');
        const archivedSkuCount = parseInt(archiveSkuRes.rows[0].count) || 0;

        const report = {
            status: 'PASS',
            type: 'ROLLBACK',
            stockBefore: preStock,
            stockAfter: postStock,
            skuCountBefore: preSkuCount,
            skuCountAfter: 0,
            archivedSkuCount,
            backupFile
        };
        
        auditor.generate(report, 'rollback_report');
        console.log("Rollback completed successfully.");
    } catch (e) {
        console.error("Rollback failed!", e);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
}
run();
