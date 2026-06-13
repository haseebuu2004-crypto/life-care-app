const fs = require('fs');
const path = require('path');

function getQueries(dir) {
    let out = '';
    const files = fs.readdirSync(dir);
    for (let file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'docs' || file.includes('test') || file.includes('run_')) continue;
        const fullPath = path.join(dir, file);
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                out += getQueries(fullPath);
            } else if (file.endsWith('.js') && !file.includes('schema')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const lines = content.split('\n');
                let inQuery = false;
                let queryStr = '';
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.includes('pool.query(') || line.includes('client.query(') || line.includes('db.query(') || (file.includes('queries.js') && line.includes('text: '))) {
                        out += `### Query in \`${fullPath}\` (Line ${i+1})\n`;
                        out += `- **Purpose:** [NEEDS CLARIFICATION]\n`;
                        out += `- **Full SQL Call:**\n\`\`\`javascript\n${line.trim()}\n\`\`\`\n`;
                        out += `- **Parameters:** [NEEDS CLARIFICATION]\n`;
                        out += `- **Returns:** [NEEDS CLARIFICATION]\n`;
                        out += `- **Called By:** [NEEDS CLARIFICATION]\n\n`;
                    }
                }
            }
        } catch (e) {}
    }
    return out;
}

const queries = getQueries(path.join(process.cwd(), 'backend'));
fs.writeFileSync('queries_dump.md', queries);
console.log('Queries dumped.');
