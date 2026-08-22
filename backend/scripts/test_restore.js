require('dotenv').config();
const pool = require('./config/db');

async function testRestore() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM attendance LIMIT 1');
        const row = res.rows[0];
        console.log("Original row is_deleted:", row.is_deleted);
        
        // Simulate reading from excel
        row.is_deleted = false; // We want to restore it as active
        row.deleted_at = null;
        
        const columns = Object.keys(row).filter(k => k !== 'id' || true);
        const dbColumns = columns;
        
        const placeholders = dbColumns.map((_, i) => `$${i + 1}`).join(', ');
        const colNames = dbColumns.join(', ');
        const values = columns.map(c => row[c]);
        
        const updateSet = dbColumns.filter(c => c !== 'id').map(c => `${c} = EXCLUDED.${c}`).join(', ');
        const query = `
            INSERT INTO attendance (${colNames}) 
            VALUES (${placeholders}) 
            ON CONFLICT (id) DO UPDATE SET ${updateSet}
        `;
        
        console.log("Query:", query);
        // console.log("Values:", values);
        
        await client.query(query, values);
        
        const res2 = await client.query('SELECT * FROM attendance WHERE id = $1', [row.id]);
        console.log("Restored row is_deleted:", res2.rows[0].is_deleted);
        
    } catch(e) {
        console.error(e);
    } finally {
        client.release();
        process.exit(0);
    }
}
testRestore();
