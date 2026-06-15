const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.jjupjsrrxmajypvbbias:hasbiya%402087@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true' });
client.connect()
  .then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'"))
  .then(r => {
    console.log("PRODUCTS COLUMNS:", r.rows.map(x => x.column_name));
    client.end();
  });
