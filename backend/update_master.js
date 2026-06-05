const db = require('./db');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        const email = 'gcgroup207@gmail.com';
        const password = 'Hasbiya@2087';
        const hash = await bcrypt.hash(password, 12);
        
        // Find existing master
        const check = await db.query(`SELECT id FROM users WHERE role = 'master'`);
        if (check.rows.length > 0) {
            console.log("Updating existing master...");
            await db.query(`UPDATE users SET email = $1, password_hash = $2 WHERE role = 'master'`, [email, hash]);
        } else {
            console.log("Creating new master...");
            await db.query(`INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'master')`, [email, hash]);
        }
        
        console.log("Master credentials updated successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Failed:", e);
        process.exit(1);
    }
}

run();
