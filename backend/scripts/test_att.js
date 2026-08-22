require('dotenv').config();
const db = require('./db');
const uid = 'bb0d31c9-a21f-411e-bd54-cc1869534ee9';
const oid = '3ab51607-4452-4941-8f3a-82de44b18ae9';
const query = `
SELECT a.id, a.recorded_by, u.email as recorded_by_email, u.id as u_id 
FROM attendance a 
LEFT JOIN users u ON a.recorded_by = u.id 
WHERE a.owner_id = $1
`;
db.query(query, [oid]).then(r => console.log('All Attendance:', r.rows)).catch(console.error).finally(()=>process.exit(0));
