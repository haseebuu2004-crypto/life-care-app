const fs = require('fs');
function getFiles(dir, files_) {
  files_ = files_ || [];
  let files = fs.readdirSync(dir);
  for (let i in files) {
    let name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory() && !name.includes('node_modules') && !name.includes('.next')) {
      getFiles(name, files_);
    } else if (name.endsWith('.jsx') && !name.includes('node_modules')) {
      files_.push(name);
    }
  }
  return files_;
}

const frontendFiles = getFiles('../frontend/src');

let md = '# Section 6 — Frontend Component Reference\n\n';

for (let file of frontendFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find component definitions: function Name(props) or const Name = (props) =>
  const compRegex = /(?:function\s+([A-Z][a-zA-Z0-9_]*)\s*\((.*?)\)|const\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*(?:memo\()?\(?(.*?)\)?\s*=>)/g;
  let hasMatch = false;
  let fileMd = '';
  
  let match;
  while ((match = compRegex.exec(content)) !== null) {
    const compName = match[1] || match[3];
    const params = match[2] || match[4] || '';
    
    let type = 'Widget';
    if (file.includes('screens') || file.includes('app')) type = 'Page';
    if (compName.includes('Modal')) type = 'Modal';
    if (compName.includes('Layout')) type = 'Layout';
    
    fileMd += '### Component: `' + compName + '`\n';
    fileMd += '- **File:** `' + file.replace('../', '') + '`\n';
    fileMd += '- **Type:** `' + type + '`\n';
    fileMd += '- **Purpose:** [NEEDS CLARIFICATION]\n';
    fileMd += '- **Props:** `' + (params || 'none') + '`\n';
    
    // Extracted useState
    const stateRegex = /const\s+\[(.*?)\]\s*=\s*useState/g;
    let states = [];
    let stateMatch;
    while((stateMatch = stateRegex.exec(content)) !== null) {
       states.push(stateMatch[1].split(',')[0].trim());
    }
    fileMd += '- **State:** ' + (states.length > 0 ? states.join(', ') : 'none') + '\n';
    fileMd += '- **API calls:** [NEEDS CLARIFICATION]\n';
    fileMd += '- **Children:** [NEEDS CLARIFICATION]\n';
    fileMd += '- **Parent:** [NEEDS CLARIFICATION]\n\n';
    hasMatch = true;
  }
  
  if (hasMatch) {
      md += fileMd;
  }
}

md += '## Routing Map\n\n';
md += '| Path | Component | Auth guard | Role guard |\n';
md += '|---|---|---|---|\n';
md += '| `/login` | `Login` | No | Public |\n';
md += '| `/dashboard` | `Dashboard` | Yes | Any authenticated |\n';
md += '| `/products` | `ProductManager` | Yes | Admin only |\n';
md += '| `/stock` | `Stock` | Yes | Admin only |\n';
md += '| `/sales` | `Sales` | Yes | Admin only |\n';
md += '| `/attendance` | `Attendance` | Yes | Admin only |\n';
md += '| `/reports` | `Reports` | Yes | Admin only |\n';
md += '| `/settings` | `Settings` | Yes | Admin only |\n';
md += '| `/data-management` | `DataManagement` | Yes | Admin only |\n';

fs.writeFileSync('../docs/06_frontend_components.md', md);
