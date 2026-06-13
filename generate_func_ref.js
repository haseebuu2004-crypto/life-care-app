const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (let file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'docs' || file.includes('test') || file.includes('run_')) continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getFiles(fullPath, fileList);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const allFiles = [...getFiles(path.join(process.cwd(), 'backend')), ...getFiles(path.join(process.cwd(), 'frontend', 'src'))];

let out = '# SECTION 4 — FUNCTION REFERENCE\n\n';

for (let file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let functions = [];

    // Basic regex to catch function declarations and arrow functions
    const funcRegex = /(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g;
    const arrowRegex = /(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/g;
    const classMethodRegex = /(?:async\s+)?([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{/g;

    let match;
    while ((match = funcRegex.exec(content)) !== null) {
        functions.push({ name: match[1], params: match[2], type: 'Function' });
    }
    while ((match = arrowRegex.exec(content)) !== null) {
        functions.push({ name: match[1], params: match[2], type: 'Arrow Function' });
    }
    
    if (functions.length > 0) {
        out += `## File: \`${file.replace(process.cwd(), '')}\`\n\n`;
        for (let fn of functions) {
            let type = 'Utility';
            if (file.includes('controller')) type = 'Controller';
            else if (file.includes('service')) type = 'Service';
            else if (file.includes('middleware')) type = 'Middleware';
            else if (file.includes('components') || file.includes('screens')) type = 'React Component';
            else if (file.includes('hooks')) type = 'Hook';

            out += `### Function: \`${fn.name}\`\n`;
            out += `- **File:** \`${file.replace(process.cwd(), '')}\`\n`;
            out += `- **Type:** ${type}\n`;
            out += `- **Purpose:** [NEEDS CLARIFICATION]\n`;
            out += `- **Parameters:** \`${fn.params || 'none'}\`\n`;
            out += `- **Returns:** [NEEDS CLARIFICATION]\n`;
            out += `- **Side effects:** [NEEDS CLARIFICATION]\n`;
            out += `- **Calls:** [NEEDS CLARIFICATION]\n`;
            out += `- **Called by:** [NEEDS CLARIFICATION]\n\n`;
        }
    }
}

fs.writeFileSync(path.join(process.cwd(), 'docs', '04_function_reference.md'), out);
console.log('Function ref generated.');
