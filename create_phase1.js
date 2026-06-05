const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, 'backend');

const sharedFolders = [
  'shared/middleware',
  'shared/utils',
  'shared/db'
];

const features = [
  'auth', 'sales', 'attendance', 'stock', 'products',
  'customers', 'dashboard', 'reports', 'backup',
  'notifications', 'master', 'settings'
];

// Create shared folders
sharedFolders.forEach(folder => {
  fs.mkdirSync(path.join(backendDir, folder), { recursive: true });
});

// Create feature folders
features.forEach(feature => {
  fs.mkdirSync(path.join(backendDir, 'features', feature), { recursive: true });
});

// Create feature files
features.forEach(feature => {
  const dir = path.join(backendDir, 'features', feature);
  fs.writeFileSync(path.join(dir, `${feature}.routes.js`), '// routes coming in next phase\n');
  fs.writeFileSync(path.join(dir, `${feature}.controller.js`), '// controller coming in next phase\n');
  fs.writeFileSync(path.join(dir, `${feature}.service.js`), '// service coming in next phase\n');
  fs.writeFileSync(path.join(dir, `${feature}.validation.js`), '// validation coming in next phase\n');
});

// Create shared files
fs.writeFileSync(path.join(backendDir, 'shared/middleware/auth.js'), '// moving in auth phase\n');
fs.writeFileSync(path.join(backendDir, 'shared/middleware/ownerScope.js'), '// moving in auth phase\n');
fs.writeFileSync(path.join(backendDir, 'shared/utils/currency.js'), '// moving in shared phase\n');
fs.writeFileSync(path.join(backendDir, 'shared/utils/audit.js'), '// moving in shared phase\n');
fs.writeFileSync(path.join(backendDir, 'shared/db/connection.js'), '// moving in shared phase\n');

console.log('Folders and files created successfully.');
