require('dotenv').config();
const db = require('./db');
async function run() {
  const res = await db.query('SELECT id, email, role, owner_id FROM users');
  console.log(res.rows);
  process.exit(0);
}
run();
