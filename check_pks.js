const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
  const res2 = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  for (let row of res2.rows) {
      const table = row.table_name;
      const pkRes = await client.query("SELECT c.column_name FROM information_schema.key_column_usage AS c LEFT JOIN information_schema.table_constraints AS t ON t.constraint_name = c.constraint_name WHERE t.table_name = $1 AND t.constraint_type = 'PRIMARY KEY'", [table]);
      console.log(table, 'PK:', pkRes.rows.map(r=>r.column_name));
      
      const unqRes = await client.query("SELECT c.column_name FROM information_schema.key_column_usage AS c LEFT JOIN information_schema.table_constraints AS t ON t.constraint_name = c.constraint_name WHERE t.table_name = $1 AND t.constraint_type = 'UNIQUE'", [table]);
      if (unqRes.rows.length > 0) {
        console.log(table, 'UNIQUE:', unqRes.rows.map(r=>r.column_name));
      }
  }
  client.end();
});
