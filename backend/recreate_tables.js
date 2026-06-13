const pool = require('./shared/db/connection');
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./backups/migration_backup_2026-06-10T12-36-30-286Z.json'));
async function run() {
    const client = await pool.pool.connect();
    try {
        for (let table in data) {
            if (data[table].length > 0) {
                const row = data[table][0];
                const cols = Object.keys(row).map(c => {
                    const val = row[c];
                    let type = 'text';
                    if (val === null) type = 'text';
                    else if (typeof val === 'boolean') type = 'boolean';
                    else if (typeof val === 'number') type = Number.isInteger(val) ? 'integer' : 'float';
                    else if (typeof val === 'string') {
                        if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)) type = 'uuid';
                        else if (!isNaN(Date.parse(val)) && val.includes('T')) type = 'timestamptz';
                    }
                    return '"' + c + '" ' + type;
                }).join(', ');
                await client.query('CREATE TABLE IF NOT EXISTS ' + table + ' (' + cols + ')');
                console.log('Created table ' + table);
            } else {
                console.log('Skipped empty table ' + table);
            }
        }
    } catch(e) {
        console.error(e);
    } finally {
        client.release();
        process.exit(0);
    }
}
run();
