require('dotenv').config();
const db = require('./shared/db/connection');
(async () => {
    const res = await db.query("SELECT proname, pg_get_function_arguments(oid) as args FROM pg_proc WHERE proname = 'create_sale_atomic'");
    console.log(res.rows);
    process.exit(0);
})();
