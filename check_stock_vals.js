const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
  const res = await client.query("SELECT * FROM stock s JOIN variants v ON s.variant_id = v.id WHERE v.is_active = false");
  console.log("Deactivated variants in stock:", res.rows.length);
  const res2 = await client.query("SELECT * FROM stock WHERE quantity < 0");
  console.log("Negative stock:", res2.rows.length);
  client.end();
});
