const db = require('./shared/db/connection');
async function f() {
    try {
        const r = await db.query(`SELECT tc.constraint_type, tc.table_name, kcu.column_name 
                                  FROM information_schema.table_constraints tc 
                                  JOIN information_schema.key_column_usage kcu 
                                    ON tc.constraint_name = kcu.constraint_name 
                                   AND tc.table_schema = kcu.table_schema 
                                  WHERE tc.constraint_type = 'PRIMARY KEY' 
                                    AND tc.table_name IN ('products', 'product_versions', 'variants')`);
        console.log("Primary keys:", r.rows);
    } catch(e) { console.error(e); }
    process.exit();
}
f();
