const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: './backend/.env' });

async function dumpSchema() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    const tablesRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    `);

    let out = '# 2.1 Full Schema\n\n';

    for (let row of tablesRes.rows) {
        const tableName = row.table_name;
        out += `### Table: \`${tableName}\`\n\n`;

        // Columns
        const colsRes = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = $1
            ORDER BY ordinal_position;
        `, [tableName]);

        out += `| Column Name | Data Type | Nullable | Default | Description |\n`;
        out += `| --- | --- | --- | --- | --- |\n`;
        for (let c of colsRes.rows) {
            out += `| \`${c.column_name}\` | \`${c.data_type}\` | ${c.is_nullable} | \`${c.column_default || 'null'}\` | [NEEDS CLARIFICATION] |\n`;
        }
        out += '\n';

        // Constraints (PK, FK, Unique)
        const conRes = await client.query(`
            SELECT conname, contype, pg_get_constraintdef(oid) as def
            FROM pg_constraint
            WHERE conrelid = $1::regclass;
        `, [tableName]);

        if (conRes.rows.length > 0) {
            out += `**Constraints:**\n`;
            for (let con of conRes.rows) {
                let typeStr = '';
                if (con.contype === 'p') typeStr = 'Primary Key';
                else if (con.contype === 'f') typeStr = 'Foreign Key';
                else if (con.contype === 'u') typeStr = 'Unique';
                else if (con.contype === 'c') typeStr = 'Check';
                out += `- **${typeStr}** (\`${con.conname}\`): \`${con.def}\`\n`;
            }
            out += '\n';
        }

        // Indexes
        const idxRes = await client.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = $1 AND indexname NOT IN (
                SELECT conname FROM pg_constraint WHERE conrelid = $1::regclass
            );
        `, [tableName]);

        if (idxRes.rows.length > 0) {
            out += `**Indexes:**\n`;
            for (let idx of idxRes.rows) {
                out += `- \`${idx.indexname}\`: \`${idx.indexdef}\`\n`;
            }
            out += '\n';
        }
    }

    fs.writeFileSync('schema_dump.md', out);
    console.log('Schema dumped.');
    await client.end();
}

dumpSchema();
