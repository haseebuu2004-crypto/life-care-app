const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
  const res = await client.query(`
      SELECT s.id, 
             v.name as product_name, 
             s.quantity as qty
      FROM stock s
      JOIN variants v ON s.variant_id = v.id
      JOIN product_versions pv ON s.product_version_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE s.quantity <= v.low_stock_threshold 
      AND v.alert_enabled = true AND pv.is_active = true
  `);
  console.table(res.rows);
  client.end();
});
