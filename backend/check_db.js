const db = require('./shared/db/connection');

async function f() {
    try {
        const r1 = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
        console.log('Tables:', r1.rows.map(r=>r.table_name));

        const r2 = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='product_versions'");
        console.log('product_versions columns:', r2.rows);

        const r3 = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products'");
        console.log('products columns:', r3.rows);

        const r4 = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='variants'");
        console.log('variants columns:', r4.rows);

        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
f();
