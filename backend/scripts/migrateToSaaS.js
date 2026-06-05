const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function migrate() {
    try {
        console.log('Starting SaaS Migration...');

        // 1. Add new columns
        console.log('Adding new columns...');
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS raw_password VARCHAR(255)`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS session_token VARCHAR(255)`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP`);

        // 2. Add 'master' to existing roles conceptually, but role is just a VARCHAR(50).
        // Let's create the Master account if it doesn't exist.
        // We will prompt the user to change this email later, but we need a placeholder.
        console.log('Ensuring master role exists...');
        const masterEmail = 'master@clubapp.com';
        const tempMasterPass = 'MasterAdmin2026!';
        const masterHash = bcrypt.hashSync(tempMasterPass, 8);
        
        const { rows: masterRows } = await pool.query('SELECT id FROM users WHERE role = $1', ['master']);
        if (masterRows.length === 0) {
            await pool.query(
                `INSERT INTO users (username, email, password, raw_password, role, owner_id) VALUES ($1, $2, $3, $4, $5, $6)`,
                ['Master', masterEmail, masterHash, tempMasterPass, 'master', 'master']
            );
            console.log(`Created Master account: ${masterEmail} / ${tempMasterPass}`);
        } else {
            console.log('Master role already exists.');
        }

        // 3. Sweep all existing users and apply Master Reset
        console.log('Sweeping existing users to apply Master Reset...');
        const { rows: allUsers } = await pool.query('SELECT id, email, username FROM users WHERE role != $1', ['master']);
        
        const TEMP_PASSWORD = 'ClubApp2026!';
        const tempHash = bcrypt.hashSync(TEMP_PASSWORD, 8);

        for (const user of allUsers) {
            const displayId = user.email || user.username || `User_${user.id}`;
            await pool.query(
                `UPDATE users SET password = $1, raw_password = $2 WHERE id = $3`,
                [tempHash, TEMP_PASSWORD, user.id]
            );
            console.log(`Reset password for: ${displayId}`);
        }

        console.log('SaaS Migration Completed Successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
