require('dotenv').config();
const db = require('./shared/db/connection');

async function run() {
    try {
        const ownerId = 'a36d25db-dd39-4245-a1a6-61aa578c33a1'; // test owner
        const recordedBy = '3f9f835b-1c5c-4a33-bf44-6cc41a4a4d64';
        const date = new Date().toISOString().split('T')[0];

        const t1 = Date.now();
        const res = await db.query(
            "SELECT mark_attendance_atomic($1, $2, $3, $4, $5, $6, $7) as result",
            [ownerId, null, 'E2E Customer Test Atomic', date, 'default', 2000, recordedBy]
        );
        const t2 = Date.now();
        
        console.log(`[TIMING] DB call took: ${t2 - t1}ms`);
        console.log(res.rows[0]);
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
