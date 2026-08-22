require('dotenv').config();
const db = require('./shared/db/connection');
(async () => {
    try {
        console.log("Dropping incorrect overloaded functions...");
        await db.query("DROP FUNCTION IF EXISTS create_sale_atomic(uuid, varchar, date, uuid, jsonb);");
        await db.query("DROP FUNCTION IF EXISTS create_sale_atomic(uuid, uuid, date, uuid, jsonb);");
        console.log("Done.");
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
})();
