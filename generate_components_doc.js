const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (let file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'docs') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getFiles(fullPath, fileList);
        } else if (file.endsWith('.jsx')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const allFiles = getFiles(path.join(process.cwd(), 'frontend', 'src'));

let out = '# SECTION 6 — FRONTEND COMPONENT REFERENCE\n\n';

for (let file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let components = [];

    const funcRegex = /(?:export\s+)?(?:default\s+)?function\s+([A-Z][a-zA-Z0-9_]+)/g;
    const arrowRegex = /(?:export\s+)?(?:const|let|var)\s+([A-Z][a-zA-Z0-9_]+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g;

    let match;
    while ((match = funcRegex.exec(content)) !== null) {
        components.push(match[1]);
    }
    while ((match = arrowRegex.exec(content)) !== null) {
        components.push(match[1]);
    }
    
    if (components.length > 0) {
        for (let comp of components) {
            let type = 'Component';
            if (file.includes('screens') || file.includes('app/')) type = 'Page';
            else if (comp.includes('Modal')) type = 'Modal';

            out += `## Component: \`${comp}\`\n`;
            out += `- **File:** \`${file.replace(process.cwd(), '')}\`\n`;
            out += `- **Type:** ${type}\n`;
            out += `- **Purpose:** [NEEDS CLARIFICATION]\n`;
            out += `- **Props:** [NEEDS CLARIFICATION]\n`;
            out += `- **State:** [NEEDS CLARIFICATION]\n`;
            out += `- **API calls:** [NEEDS CLARIFICATION]\n`;
            out += `- **Children:** [NEEDS CLARIFICATION]\n`;
            out += `- **Parent:** [NEEDS CLARIFICATION]\n\n`;
        }
    }
}

// Add routing map scaffold
out += `\n## Routing Map\n\n`;
out += `| Path | Component | Auth guard | Role guard |\n`;
out += `| --- | --- | --- | --- |\n`;
out += `| \`/\` | \`Home\` | No | Public |\n`;
out += `| \`[NEEDS CLARIFICATION]\` | \`[NEEDS CLARIFICATION]\` | \`[NEEDS CLARIFICATION]\` | \`[NEEDS CLARIFICATION]\` |\n`;

fs.writeFileSync(path.join(process.cwd(), 'docs', '06_frontend_components.md'), out);
console.log('Frontend components generated.');
