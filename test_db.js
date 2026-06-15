require('dotenv').config({ path: './backend/.env' });
const db = require('./backend/shared/db/connection');
(async () => {
    try {
        const res = await db.query("SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'products'");
        console.log(res.rows);
        const res2 = await db.query("SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'products'");
        console.log(res2.rows);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
})();
