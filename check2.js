const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
  const res = await client.query("SELECT * FROM product_versions");
  console.table(res.rows);
  client.end();
});
