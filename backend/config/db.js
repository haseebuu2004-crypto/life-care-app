const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const runMigrations = require('../migrations/index');

const dbPath = path.resolve(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
        runMigrations(db).then(() => {
            console.log('Database migrations verified successfully.');
        }).catch(err => {
            console.error('Failed to run migrations on startup:', err);
        });
    }
});

function createTables() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'user'
        )`, () => {
            // Seed admin user
            db.get(`SELECT id FROM users WHERE username = ?`, ['admin'], (err, row) => {
                if (!row) {
                    const hash = bcrypt.hashSync('admin123', 8);
                    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['admin', hash, 'admin']);
                }
            });
            // Seed default user
            db.get(`SELECT id FROM users WHERE username = ?`, ['user'], (err, row) => {
                if (!row) {
                    const hash = bcrypt.hashSync('user123', 8);
                    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['user', hash, 'user']);
                }
            });
        });

        // Products Table (Base Products)
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1
        )`, () => {
            db.run("ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1", () => {});
        });

        // Product Variants Table
        db.run(`CREATE TABLE IF NOT EXISTS product_variants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            flavor TEXT,
            vp REAL DEFAULT 0,
            sp REAL DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        )`);

        // Stock Table (Pure Stock Data)
        db.run(`CREATE TABLE IF NOT EXISTS stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            variant_id INTEGER UNIQUE,
            qty INTEGER DEFAULT 0,
            FOREIGN KEY(variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
        )`);

        // Sales Table (Transactions)
        db.run(`CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            customer TEXT,
            total_amount REAL DEFAULT 0,
            total_profit REAL DEFAULT 0
        )`);

        // Sale Items Table
        db.run(`CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER,
            variant_id INTEGER,
            qty INTEGER,
            sale_price REAL,
            total_amount REAL,
            profit REAL,
            FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
            FOREIGN KEY(variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
        )`);

        // Settings Table
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE,
            value TEXT
        )`);

        // Attendance Table
        db.run(`CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            name TEXT,
            status TEXT,
            others_deduction REAL DEFAULT 0,
            shake_profit REAL DEFAULT 0
        )`, () => {
            db.run("ALTER TABLE attendance ADD COLUMN others_deduction REAL DEFAULT 0", () => {});
            db.run("ALTER TABLE attendance ADD COLUMN shake_profit REAL DEFAULT 0", () => {});
        });

        // Usage table removed

        // Login History Table
        db.run(`CREATE TABLE IF NOT EXISTS login_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT,
            role TEXT,
            login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            logout_time DATETIME,
            device TEXT,
            browser TEXT,
            ip TEXT
        )`);

        // Performance Indexes
        db.run(`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_name ON attendance(name)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`);
    });
}

module.exports = db;
