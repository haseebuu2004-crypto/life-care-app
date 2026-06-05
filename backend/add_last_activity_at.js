const db = require('./db');

async function run() {
    try {
        console.log("Adding last_activity_at to sessions table...");
        await db.query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();`);
        console.log("Column added successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Failed:", e);
        process.exit(1);
    }
}

run();
