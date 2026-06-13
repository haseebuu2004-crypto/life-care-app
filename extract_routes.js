const fs = require('fs');
const path = require('path');

function extractRoutes(dir) {
    let out = '# SECTION 3 — BACKEND API REFERENCE\n\n';
    const files = fs.readdirSync(dir, { recursive: true });
    
    for (let file of files) {
        if (!file.endsWith('.routes.js')) continue;
        const fullPath = path.join(dir, file);
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        
        out += `## Module: \`${file}\`\n\n`;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/router\.(get|post|put|delete)\(['"]([^'"]+)['"],\s*(.+)\)/);
            if (match) {
                const method = match[1].toUpperCase();
                const routePath = match[2];
                const handlers = match[3];
                
                let authReq = handlers.includes('requireAuth') ? 'Yes' : 'No';
                let roleReq = handlers.includes('requireAdmin') ? 'Admin' : handlers.includes('requireMaster') ? 'Master' : 'Any authenticated';
                if (authReq === 'No') roleReq = 'Any';
                
                out += `### \`[${method}] /api/${file.split('.')[0]}${routePath === '/' ? '' : routePath}\`\n`;
                out += `- **File:** \`${fullPath.split('\\').slice(-3).join('/')}\`\n`;
                out += `- **Handlers/Controller:** \`${handlers}\`\n`;
                out += `- **Auth required:** ${authReq}\n`;
                out += `- **Role required:** ${roleReq}\n`;
                out += `- **Tenant scoped:** ${handlers.includes('enforceOwnerScope') ? 'Yes' : 'No'}\n`;
                
                out += `\n**Request:**\n`;
                out += `- Params: \`[NEEDS CLARIFICATION]\`\n`;
                out += `- Query: \`[NEEDS CLARIFICATION]\`\n`;
                out += `- Body: \`[NEEDS CLARIFICATION]\`\n`;
                
                out += `\n**Response:**\n`;
                out += `- 200: \`{ success: true, data: [...] }\`\n`;
                out += `- 400: \`{ message: "Bad Request" }\`\n`;
                out += `- 401: \`{ message: "Unauthorized" }\`\n`;
                out += `- 500: \`{ message: "Internal Server Error" }\`\n\n`;
            }
        }
    }
    return out;
}

const routes = extractRoutes(path.join(process.cwd(), 'backend', 'features'));
fs.writeFileSync(path.join(process.cwd(), 'docs', '03_api_reference.md'), routes);
console.log('Routes dumped.');
