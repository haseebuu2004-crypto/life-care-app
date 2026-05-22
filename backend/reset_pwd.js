const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({path: '.env'});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const hash = bcrypt.hashSync('admin123', 8);
pool.query('UPDATE users SET password = $1 WHERE username = $2', [hash, 'admin'])
    .then(res => {
        console.log('Password reset to admin123');
        process.exit(0);
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
