require('dotenv').config();
const db = require('./db');
async function run() {
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS backup_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                backup_type VARCHAR(50) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                storage_provider VARCHAR(50),
                file_url TEXT,
                file_size BIGINT,
                status VARCHAR(50) NOT NULL,
                created_by VARCHAR(100),
                notes TEXT,
                restore_status VARCHAR(50),
                restore_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_backup_owner ON backup_logs(owner_id, created_at DESC);
        `;
        await db.query(sql);
        console.log("Successfully created backup_logs table");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
