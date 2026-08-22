require('dotenv').config();
const db = require('./db');

async function main() {
    try {
        const salesCols = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'sales'");
        console.log("Sales columns:", salesCols.rows.map(r => r.column_name).join(', '));

        const attendanceCols = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'attendance'");
        console.log("Attendance columns:", attendanceCols.rows.map(r => r.column_name).join(', '));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

main();
