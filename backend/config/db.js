const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Stock Table (Variations/Flavors)
        db.run(`CREATE TABLE IF NOT EXISTS stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            flavor TEXT,
            vp REAL DEFAULT 0,
            sp REAL DEFAULT 0,
            qty INTEGER DEFAULT 0,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        )`);

        // Sales Table
        db.run(`CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            customer TEXT,
            stock_id INTEGER,
            qty INTEGER,
            sale_price REAL,
            total_amount REAL,
            profit REAL,
            FOREIGN KEY(stock_id) REFERENCES stock(id) ON DELETE SET NULL
        )`);

        // Attendance Table
        db.run(`CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            name TEXT,
            status TEXT
        )`);

        // Personal Usage Table
        db.run(`CREATE TABLE IF NOT EXISTS personal_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            f1 REAL DEFAULT 0,
            pp REAL DEFAULT 0,
            afresh REAL DEFAULT 0,
            others REAL DEFAULT 0,
            sp REAL DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(name)
        )`);
    });
}

module.exports = db;
