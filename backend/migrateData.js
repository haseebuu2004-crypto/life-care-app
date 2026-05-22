require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const sqliteDb = new sqlite3.Database('./data/database.sqlite', (err) => {
    if (err) {
        console.error('Error opening sqlite DB', err);
        process.exit(1);
    }
});

const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const tablesToMigrate = [
    'users',
    'settings',
    'products',
    'product_variants',
    'stock',
    'sales',
    'sale_items',
    'attendance',
    'login_history'
];

async function migrateTable(tableName) {
    return new Promise((resolve, reject) => {
        sqliteDb.all(`SELECT * FROM ${tableName}`, async (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) {
                console.log(`Table ${tableName} is empty, skipping.`);
                return resolve();
            }

            console.log(`Migrating ${rows.length} rows for table ${tableName}...`);
            const client = await pgPool.connect();
            try {
                await client.query('BEGIN');
                
                // Truncate PG table first just in case? No, better to just insert IF NOT EXISTS or handle conflicts, 
                // but since we want to migrate completely, we should clear the table or assume it's fresh.
                // We'll clear the table to prevent duplicates during multiple runs.
                await client.query(`TRUNCATE TABLE ${tableName} CASCADE`);
                
                for (const row of rows) {
                    const columns = Object.keys(row);
                    const values = Object.values(row);
                    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
                    const colNames = columns.join(', ');
                    
                    const query = `INSERT INTO ${tableName} (${colNames}) VALUES (${placeholders})`;
                    await client.query(query, values);
                }
                
                // Fix sequence for SERIAL primary keys
                const { rows: maxRows } = await client.query(`SELECT MAX(id) as max_id FROM ${tableName}`);
                const maxId = maxRows[0].max_id;
                if (maxId) {
                    await client.query(`SELECT setval('${tableName}_id_seq', ${maxId})`);
                }

                await client.query('COMMIT');
                console.log(`✅ Table ${tableName} migrated successfully.`);
                resolve();
            } catch (error) {
                await client.query('ROLLBACK');
                console.error(`❌ Error migrating table ${tableName}`, error);
                reject(error);
            } finally {
                client.release();
            }
        });
    });
}

async function runMigration() {
    console.log("Starting SQLite to PostgreSQL migration...");
    try {
        for (const table of tablesToMigrate) {
            await migrateTable(table);
        }
        console.log("All tables migrated successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        sqliteDb.close();
        pgPool.end();
    }
}

runMigration();
