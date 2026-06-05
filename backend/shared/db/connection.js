const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Supabase usually
    max: 12 // Restrict max clients to avoid Supabase 15 connection limit
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // Removed process.exit(-1) because the pool will automatically reconnect/recover
});

async function initDB() {
    try {
        console.log('Connected to the PostgreSQL database.');
        console.log('Database migrations are now managed by Prisma.');
    } catch (err) {
        console.error('Failed to initialize database on startup:', err);
    }
}

async function createTables() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Users Table
        await client.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255),
            password VARCHAR(255),
            role VARCHAR(50) DEFAULT 'user',
            email VARCHAR(255),
            google_id VARCHAR(255),
            auth_provider VARCHAR(50) DEFAULT 'local',
            owner_id VARCHAR(255),
            reset_token VARCHAR(255),
            reset_token_expiry TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(username, owner_id)
        )`);

        // Add columns if they are missing (for existing databases)
        try {
            await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)`);
            await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP`);
            await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        } catch (alterErr) {
            console.error("Error altering users table (columns might already exist)", alterErr);
        }

        // Seed users
        const { rows: adminRows } = await client.query(`SELECT id FROM users WHERE username = $1`, ['admin']);
        if (adminRows.length === 0) {
            const hash = bcrypt.hashSync('admin123', 8);
            await client.query(`INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`, ['admin', hash, 'admin']);
        }

        const { rows: userRows } = await client.query(`SELECT id FROM users WHERE username = $1`, ['user']);
        if (userRows.length === 0) {
            const hash = bcrypt.hashSync('user123', 8);
            await client.query(`INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`, ['user', hash, 'user']);
        }

        // Products Table
        await client.query(`CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1,
            owner_id VARCHAR(255),
            UNIQUE(name, owner_id)
        )`);

        // Product Variants Table
        await client.query(`CREATE TABLE IF NOT EXISTS product_variants (
            id SERIAL PRIMARY KEY,
            product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
            flavor VARCHAR(255),
            vp REAL DEFAULT 0,
            sp REAL DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            owner_id VARCHAR(255)
        )`);

        // Stock Table
        await client.query(`CREATE TABLE IF NOT EXISTS stock (
            id SERIAL PRIMARY KEY,
            variant_id INTEGER UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
            qty INTEGER DEFAULT 0,
            owner_id VARCHAR(255)
        )`);

        // Sales Table
        await client.query(`CREATE TABLE IF NOT EXISTS sales (
            id SERIAL PRIMARY KEY,
            date TIMESTAMP,
            customer VARCHAR(255),
            total_amount REAL DEFAULT 0,
            total_profit REAL DEFAULT 0,
            owner_id VARCHAR(255)
        )`);

        // Sale Items Table
        await client.query(`CREATE TABLE IF NOT EXISTS sale_items (
            id SERIAL PRIMARY KEY,
            sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
            variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
            qty INTEGER,
            sale_price REAL,
            total_amount REAL,
            profit REAL,
            owner_id VARCHAR(255)
        )`);

        // Settings Table
        await client.query(`CREATE TABLE IF NOT EXISTS settings (
            id SERIAL PRIMARY KEY,
            key VARCHAR(255),
            value TEXT,
            owner_id VARCHAR(255),
            UNIQUE(key, owner_id)
        )`);

        // Attendance Table
        await client.query(`CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            date TIMESTAMP,
            name VARCHAR(255),
            status VARCHAR(50),
            others_deduction REAL DEFAULT 0,
            shake_profit REAL DEFAULT 0,
            owner_id VARCHAR(255)
        )`);

        // Login History Table
        await client.query(`CREATE TABLE IF NOT EXISTS login_history (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            username VARCHAR(255),
            role VARCHAR(50),
            login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            logout_time TIMESTAMP,
            device VARCHAR(255),
            browser VARCHAR(255),
            ip VARCHAR(255)
        )`);

        // Refresh Tokens Table
        await client.query(`CREATE TABLE IF NOT EXISTS refresh_tokens (
            id SERIAL PRIMARY KEY,
            token VARCHAR(255) UNIQUE NOT NULL,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Backup Logs Table
        await client.query(`CREATE TABLE IF NOT EXISTS backup_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            owner_id VARCHAR(255) NOT NULL,
            backup_type VARCHAR(50) NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            storage_provider VARCHAR(50) NOT NULL,
            file_url TEXT,
            file_size BIGINT,
            status VARCHAR(50) NOT NULL,
            created_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            restore_status VARCHAR(50) DEFAULT 'None',
            restore_at TIMESTAMP,
            notes TEXT
        )`);

        // Performance Indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_name ON attendance(name)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`);

        // Multi-tenant optimization indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_products_owner ON products(owner_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_product_variants_owner ON product_variants(owner_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_stock_owner ON stock(owner_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_owner ON sales(owner_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_owner_date ON sales(owner_id, date)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_sale_items_owner ON sale_items(owner_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_owner ON attendance(owner_id)`);

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Error creating tables", e);
    } finally {
        client.release();
    }
}

initDB();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
