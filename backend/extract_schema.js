require('dotenv').config();
const db = require('./shared/db/connection');
async function run() {
  const client = await db.pool.connect();
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  
  let schema = {};
  for(let row of tables.rows) {
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [row.table_name]);
    schema[row.table_name] = cols.rows;
  }
  
  const fks = await client.query(`
    SELECT
      tc.table_name, kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY';
  `);
  
  require('fs').writeFileSync('../docs/db_schema.json', JSON.stringify({ tables: schema, fks: fks.rows }, null, 2));
  client.release();
  process.exit(0);
}
run();
