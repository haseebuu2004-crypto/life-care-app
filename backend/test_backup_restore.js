require('dotenv').config();
const backupService = require('./features/backup/backup.service');
const restoreService = require('./features/backup/restore.service');
const pool = require('./shared/db/connection');

async function test() {
    try {
        const ownerId = 'admin1'; // We need an ownerId
        const data = await backupService.getExportData('full', ownerId);
        console.log('Exported data keys:', Object.keys(data));
        if(data.variants && data.variants.length > 0) {
            console.log('First variant:', data.variants[0]);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
test();
