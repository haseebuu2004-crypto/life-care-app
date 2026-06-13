const fs = require('fs');
function getFiles(dir, files_) {
  files_ = files_ || [];
  let files = fs.readdirSync(dir);
  for (let i in files) {
    let name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory() && !name.includes('node_modules') && !name.includes('.next')) {
      getFiles(name, files_);
    } else if ((name.endsWith('.js') || name.endsWith('.jsx')) && !name.includes('node_modules')) {
      files_.push(name);
    }
  }
  return files_;
}

const backendFiles = getFiles('.');
const frontendFiles = getFiles('../frontend/src');
const allFiles = [...backendFiles, ...frontendFiles];

let md = '# Section 4 — Function Reference\n\n';

for (let file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let hasMatch = false;
  let fileMd = '';
  
  const funcRegex = /(?:exports\.|function\s+|const\s+)([a-zA-Z0-9_]+)\s*(?:=\s*(?:async\s*)?\((.*?)\)\s*=>|\((.*?)\)\s*\{)/g;
  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    const funcName = match[1];
    if (funcName === 'require' || funcName === 'if' || funcName === 'catch') continue;
    
    let params = match[2] || match[3] || '';
    
    let type = 'Utility';
    if (file.includes('controller')) type = 'Controller';
    else if (file.includes('service')) type = 'Service';
    else if (file.includes('validation')) type = 'Validator';
    else if (file.includes('middleware')) type = 'Middleware';
    else if (file.includes('components') || file.includes('screens')) type = 'React Component';
    else if (file.includes('hooks')) type = 'Hook';

    fileMd += '### `' + funcName + '`\n';
    fileMd += '- **Function:** `' + funcName + '`\n';
    fileMd += '- **File:** `' + file + '`\n';
    fileMd += '- **Type:** `' + type + '`\n';
    fileMd += '- **Purpose:** [NEEDS CLARIFICATION]\n';
    fileMd += '- **Parameters:** `' + (params || 'none') + '`\n';
    fileMd += '- **Returns:** [NEEDS CLARIFICATION]\n';
    fileMd += '- **Side effects:** [NEEDS CLARIFICATION]\n';
    fileMd += '- **Calls:** [NEEDS CLARIFICATION]\n';
    fileMd += '- **Called by:** [NEEDS CLARIFICATION]\n\n';
    hasMatch = true;
  }
  
  if (hasMatch) {
      md += '## File: `' + file.replace('../', '') + '`\n\n';
      md += fileMd;
  }
}

fs.writeFileSync('../docs/04_function_reference.md', md);
