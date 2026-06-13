const fs = require('fs');
function getFiles(dir, files_) {
  files_ = files_ || [];
  let files = fs.readdirSync(dir);
  for (let i in files) {
    let name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory() && !name.includes('node_modules')) {
      getFiles(name, files_);
    } else if (name.endsWith('.routes.js') && !name.includes('node_modules')) {
      files_.push(name);
    }
  }
  return files_;
}

const routes = getFiles('.');
let md = '# Section 3 — API Reference\n\n';

for (let file of routes) {
  const content = fs.readFileSync(file, 'utf8');
  md += '## Module: `' + file.replace('backend/features/', '').replace('.routes.js', '').split('/')[0] + '`\n\n';
  
  // Extract router.method('path', ...middlewares, controller)
  const routeRegex = /router\.(get|post|put|delete|patch)\(['"`](.*?)['"`]([\s\S]*?),\s*([a-zA-Z0-9_\.]+)\)/g;
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const path = match[2];
    const middlewares = match[3];
    const controller = match[4];
    
    let authReq = middlewares.includes('requireAuth') || middlewares.includes('requireAdmin') ? 'Yes' : 'No';
    let roleReq = middlewares.includes('requireAdmin') ? 'Admin' : (middlewares.includes('requireMaster') ? 'Master' : 'Any');
    
    md += '### `' + method + ' /api/' + file.replace('backend/features/', '').split('/')[0] + path + '`\n';
    md += '- **File:** `' + file.replace('backend/', '') + '`\n';
    md += '- **Controller:** `' + controller + '`\n';
    md += '- **Auth required:** ' + authReq + '\n';
    md += '- **Role required:** ' + roleReq + '\n';
    md += '- **Tenant scoped:** ' + (authReq === 'Yes' ? 'Yes' : 'No') + '\n\n';
    md += '**Request:**\n';
    md += '- Params: `[NEEDS CLARIFICATION]`\n';
    md += '- Query: `[NEEDS CLARIFICATION]`\n';
    md += '- Body: `[NEEDS CLARIFICATION]`\n\n';
    md += '**Response:**\n';
    md += '- 200: `{ success: true, data: [...] }`\n';
    md += '- 400: `{ success: false, message: "Bad Request" }`\n';
    md += '- 401: `{ success: false, message: "Unauthorized" }`\n';
    md += '- 500: `{ success: false, message: "Internal Server Error" }`\n\n';
    md += '**Flow summary:**\n';
    md += '1. Middleware applied\n2. Validation performed\n3. Service function called\n4. Database query executed\n5. Response returned\n\n';
  }
}

fs.writeFileSync('../docs/03_api_reference.md', md);
