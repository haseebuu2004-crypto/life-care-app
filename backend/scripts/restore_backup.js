require('dotenv').config({path: '../.env'});
const fs = require('fs');
const pool = require('../shared/db/connection');

async function restore(file, mode) {
    console.log(`Running restore for ${file} in ${mode} mode...`);
    if (!fs.existsSync(file)) {
        console.error("Backup file not found!");
        process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));

    if (mode === 'validate') {
        console.log("Validation mode: Checking backup structure.");
        const tables = ['products', 'product_versions', 'stock', 'sale_items', 'variant_rollback_archive', 'sale_item_variant_archive', 'variants', 'flavours'];
        let valid = true;
        for (let t of tables) {
            if (!Array.isArray(data[t])) {
                console.error(`Missing or invalid table: ${t}`);
                valid = false;
            }
        }
        if (valid) console.log("Validation PASS"); else console.log("Validation FAIL");
        process.exit(valid ? 0 : 1);
    }

    if (mode === 'dry-run') {
        console.log("Dry-run mode: Simulated restore.");
        for (const table of Object.keys(data)) {
            console.log(`Would restore ${data[table].length} rows into ${table}`);
        }
        process.exit(0);
    }

    console.log("Restoring data...");
    const client = await pool.pool.connect();
    try {
        await client.query('BEGIN');
        
        // Restore data
        for (const table of Object.keys(data)) {
            if (data[table].length === 0) continue;
            await client.query(`SAVEPOINT before_table`);
            try {
                await client.query(`ALTER TABLE IF EXISTS ${table} DISABLE TRIGGER USER;`); // Use USER instead of ALL to avoid system trigger errors
                await client.query(`TRUNCATE TABLE ${table} CASCADE;`);
                
                const columns = Object.keys(data[table][0]);
                const colsStr = columns.map(c => `"${c}"`).join(',');
                
                for (const row of data[table]) {
                    const vals = columns.map(c => row[c]);
                    const placeholders = columns.map((_, i) => `$${i+1}`).join(',');
                    await client.query(`INSERT INTO ${table} (${colsStr}) VALUES (${placeholders})`, vals);
                }
                await client.query(`ALTER TABLE IF EXISTS ${table} ENABLE TRIGGER USER;`);
                await client.query(`RELEASE SAVEPOINT before_table`);
                console.log(`Restored ${data[table].length} rows into ${table}`);
            } catch (e) {
                await client.query(`ROLLBACK TO SAVEPOINT before_table`);
                console.error(`Skipping table ${table} due to error: ${e.message}`);
            }
        }
        await client.query('COMMIT');
        console.log("Restore complete.");
    } catch(e) {
        await client.query('ROLLBACK');
        console.error("Restore failed:", e);
    } finally {
        client.release();
        process.exit(0);
    }
}

const file = process.argv[2];
const mode = process.argv[3] ? process.argv[3].replace('--', '') : 'execute';

if (!file) {
    console.log("Usage: node restore_backup.js <file.json> [--dry-run|--validate]");
    process.exit(1);
}

restore(file, mode);
