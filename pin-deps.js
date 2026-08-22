const fs = require('fs');
const cp = require('child_process');

const dirs = ['.', 'backend', 'frontend', 'frontend-vite'];

dirs.forEach(dir => {
    const pkgPath = `${dir}/package.json`;
    if (!fs.existsSync(pkgPath)) return;
    
    const pkgStr = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgStr);
    
    // Get current installed versions via npm ls
    const getInstalledVersions = () => {
        try {
            const ls = cp.execSync('npm ls --json --depth=0', { cwd: dir, encoding: 'utf8' });
            return JSON.parse(ls).dependencies || {};
        } catch(e) {
            if (e.stdout) {
                return JSON.parse(e.stdout).dependencies || {};
            }
            return {};
        }
    };
    
    const installed = getInstalledVersions();
    
    const pinDeps = (depsObj) => {
        if (!depsObj) return;
        for (const [name, versionRange] of Object.entries(depsObj)) {
            if (installed[name] && installed[name].version) {
                depsObj[name] = installed[name].version;
            } else {
                // fallback if not found in npm ls, just strip ^ and ~
                depsObj[name] = versionRange.replace(/^[\^~]/, '');
            }
        }
    };
    
    pinDeps(pkg.dependencies);
    pinDeps(pkg.devDependencies);
    
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`Pinned ${pkgPath}`);
});
