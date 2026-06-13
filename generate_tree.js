const fs = require('fs');
const path = require('path');

function getTree(dir, prefix = '') {
    const files = fs.readdirSync(dir);
    let out = '';
    files.forEach((file, index) => {
        if (file === 'node_modules' || file === '.git' || file === 'build' || file === 'dist' || file === '.next' || file === 'frontend-vite') return;
        const fullPath = path.join(dir, file);
        const isLast = index === files.length - 1;
        const pointer = isLast ? '└── ' : '├── ';
        
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                out += prefix + pointer + file + '/\n';
                out += getTree(fullPath, prefix + (isLast ? '    ' : '│   '));
            }
        } catch (e) {}
    });
    return out;
}

const tree = getTree(process.cwd());
fs.mkdirSync(path.join(process.cwd(), 'docs'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'docs', 'tree.txt'), tree);
console.log('Tree generated.');
