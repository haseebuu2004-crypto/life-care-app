const fs = require('fs');
const path = require('path');

const srcOld = path.join(__dirname, 'frontend-vite/src');
const srcNew = path.join(__dirname, 'frontend/src');
const publicNew = path.join(__dirname, 'frontend/public');

// Ensure target directories exist
['components', 'context', 'hooks', 'services', 'store', 'utils', 'pages'].forEach(dir => {
    fs.mkdirSync(path.join(srcNew, dir), { recursive: true });
});

// Copy assets to public
if (fs.existsSync(path.join(srcOld, 'assets'))) {
    fs.cpSync(path.join(srcOld, 'assets'), path.join(publicNew, 'assets'), { recursive: true });
}

// Function to process and port files
function processFile(filePath, isComponent = true) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Make it a client component
    if (content.includes('import') || content.includes('export')) {
        if (!content.startsWith('"use client";') && !content.startsWith("'use client';")) {
            content = `"use client";\n` + content;
        }
    }

    // Replace React Router with Next.js navigation
    content = content.replace(/from\s+['"]react-router-dom['"]/g, 'from "react-router-dom-shim"'); // We will use a shim or replace natively
    // Actually let's directly replace natively where possible
    content = content.replace(/import\s*\{(.*?)\}\s*from\s*['"]react-router-dom['"]/g, (match, p1) => {
        let imports = p1.split(',').map(s => s.trim());
        let res = [];
        if (imports.includes('Link')) {
            res.push(`import Link from 'next/link';`);
            imports = imports.filter(i => i !== 'Link');
        }
        
        let navImports = [];
        if (imports.includes('useNavigate')) {
            navImports.push('useRouter as useNavigate');
            imports = imports.filter(i => i !== 'useNavigate');
        }
        if (imports.includes('useParams')) {
            navImports.push('useParams');
            imports = imports.filter(i => i !== 'useParams');
        }
        if (navImports.length > 0) {
            res.push(`import { ${navImports.join(', ')} } from 'next/navigation';`);
        }
        
        if (imports.length > 0) {
             // For Navigate or others, we can create a shim
             res.push(`import { ${imports.join(', ')} } from '@/utils/routerShim';`);
        }
        return res.join('\n');
    });

    // Fix absolute imports or asset imports
    // Vite: import hero from '../assets/hero.png' -> Next.js: '/assets/hero.png'
    content = content.replace(/import\s+(\w+)\s+from\s+['"](?:\.\.\/)+assets\/([^'"]+)['"]/g, (match, varName, fileName) => {
        return `const ${varName} = '/assets/${fileName}';`;
    });

    return content;
}

// Copy directories
['components', 'context', 'hooks', 'services', 'store', 'utils', 'pages'].forEach(dir => {
    const dirPath = path.join(srcOld, dir);
    if (!fs.existsSync(dirPath)) return;
    
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isFile() && (file.endsWith('.js') || file.endsWith('.jsx'))) {
            const newContent = processFile(fullPath);
            fs.writeFileSync(path.join(srcNew, dir, file), newContent);
        } else if (fs.statSync(fullPath).isDirectory()) {
            // simple 1-level deep for now
            fs.mkdirSync(path.join(srcNew, dir, file), { recursive: true });
            const subFiles = fs.readdirSync(fullPath);
            subFiles.forEach(subFile => {
                if (subFile.endsWith('.js') || subFile.endsWith('.jsx')) {
                    const newContent = processFile(path.join(fullPath, subFile));
                    fs.writeFileSync(path.join(srcNew, dir, file, subFile), newContent);
                }
            });
        }
    });
});

// Create router shim
fs.writeFileSync(path.join(srcNew, 'utils', 'routerShim.js'), `
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export function Navigate({ to, replace }) {
    const router = useRouter();
    useEffect(() => {
        if (replace) router.replace(to);
        else router.push(to);
    }, [to, replace, router]);
    return null;
}
`);

// Build Next.js App Router Structure
const appDir = path.join(srcNew, 'app');

const routes = {
    '': 'Dashboard',
    'login': 'Login',
    'reset-password/[token]': 'ResetPassword',
    'master': 'MasterDashboard',
    'stock': 'Stock',
    'sales': 'Sales',
    'attendance': 'Attendance',
    'data-management': 'DataManagement',
    'reports': 'Reports',
    'settings': 'Settings',
    'users': 'UserManagement',
    'login-activity': 'LoginActivity',
    'admin/backups': 'AdminBackupCenter'
};

Object.entries(routes).forEach(([routePath, component]) => {
    const routeDir = path.join(appDir, routePath);
    fs.mkdirSync(routeDir, { recursive: true });
    
    const pageContent = `"use client";
import { ${component} } from '@/pages/${component}';
import { useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { Navigate } from '@/utils/routerShim';

export default function Page() {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    
    ${
      routePath === 'login' || routePath.startsWith('reset-password') ? `
      return <${component} />;
      ` : routePath === 'master' ? `
      if (!user) return <Navigate to="/login" replace />;
      if (user.role !== 'master') return <Navigate to="/" replace />;
      return <Layout><${component} /></Layout>;
      ` : routePath === 'users' || routePath === 'login-activity' || routePath.startsWith('admin') ? `
      if (!user) return <Navigate to="/login" replace />;
      if (user.role === 'master') return <Navigate to="/master" replace />;
      if (user.role !== 'admin') return <Navigate to="/" replace />;
      return <Layout><${component} /></Layout>;
      ` : `
      if (!user) return <Navigate to="/login" replace />;
      if (user.role === 'master') return <Navigate to="/master" replace />;
      return <Layout><${component} /></Layout>;
      `
    }
}
`;
    fs.writeFileSync(path.join(routeDir, 'page.jsx'), pageContent);
});

// Update root layout to include AuthProvider
const layoutContent = `
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Life Care System',
  description: 'Life Care System SaaS App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
`;
fs.writeFileSync(path.join(appDir, 'layout.jsx'), layoutContent);

// Copy global CSS
const oldCss = fs.readFileSync(path.join(srcOld, 'index.css'), 'utf8');
fs.writeFileSync(path.join(appDir, 'globals.css'), oldCss);

// Fix Layout.jsx since it might use <Outlet /> from react-router-dom
const layoutPath = path.join(srcNew, 'components', 'Layout.jsx');
if (fs.existsSync(layoutPath)) {
    let l = fs.readFileSync(layoutPath, 'utf8');
    l = l.replace(/import\s*\{\s*Outlet\s*\}\s*from\s*['"]react-router-dom['"];?/g, '');
    l = l.replace(/<Outlet\s*\/>/g, '{children}');
    l = l.replace(/export\s+function\s+Layout\(\)/g, 'export function Layout({ children })');
    
    // Convert 'to' to 'href' in NavLinks or Links for Next.js if any
    l = l.replace(/to=(['"]\/.*['"])/g, 'href=$1');
    fs.writeFileSync(layoutPath, l);
}

// Fix Next config to support CORS proxy if needed, and setup env vars
const envFile = fs.readFileSync(path.join(__dirname, 'frontend-vite', '.env'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'frontend', '.env'), envFile.replace(/VITE_/g, 'NEXT_PUBLIC_'));

// Fix services/api.js which uses import.meta.env
const apiPath = path.join(srcNew, 'services', 'api.js');
if (fs.existsSync(apiPath)) {
    let a = fs.readFileSync(apiPath, 'utf8');
    a = a.replace(/import\.meta\.env\.VITE_API_URL/g, 'process.env.NEXT_PUBLIC_API_URL');
    fs.writeFileSync(apiPath, a);
}

// Fix firebase config
const fbPath = path.join(srcNew, 'services', 'firebase.js');
if (fs.existsSync(fbPath)) {
    let f = fs.readFileSync(fbPath, 'utf8');
    f = f.replace(/import\.meta\.env\.VITE_/g, 'process.env.NEXT_PUBLIC_');
    fs.writeFileSync(fbPath, f);
}

console.log("Migration script complete.");
