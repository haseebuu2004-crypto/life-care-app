const fs = require('fs');
const path = require('path');

const schema = fs.readFileSync('schema_dump.md', 'utf8');
const queries = fs.readFileSync('queries_dump.md', 'utf8');

const erDiagram = `
## 2.2 Entity Relationship Summary

The database uses \`users\` (or \`master_sessions\`) as the highest level authentication.
Each \`user\` (often acting as the \`owner_id\` or \`created_by\`) owns \`products\` and \`customers\`.

\`products\` can have multiple \`product_versions\` (to track price changes over time).
Each \`product_version\` can have multiple \`variants\` (flavours or types like 'Choco', 'Paan').
Each \`variant\` acts as a unique stockable item.

\`stock\` entries directly reference \`product_versions\` or \`variants\` to increase inventory levels.

\`sales\` are linked to a \`customer\` and an \`owner_id\`.
Each \`sale\` has multiple \`sale_items\`, which link to the specific \`variant\` sold.

\`attendance\` tracks daily visits for \`customers\`.

### ASCII Diagram

\`\`\`text
users (1) 
  │
  ├─── (many) ──→ products (1) ──→ (many) product_versions (1) ──→ (many) variants
  │                                           │
  ├─── (many) ──→ customers (1)               │
  │                 │                         └── (many) stock
  │                 └── (many) attendance
  │
  └─── (many) ──→ sales (1) ──→ (many) sale_items (many) ──→ (1) variants
\`\`\`

---

## 2.3 Every Database Query
\n`;

const finalFile = `# SECTION 2 — DATABASE DOCUMENTATION\n\n` + schema + erDiagram + queries;
fs.writeFileSync(path.join(process.cwd(), 'docs', '02_database.md'), finalFile);
console.log('Database doc generated.');
