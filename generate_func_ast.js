const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

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

const allFiles = [
    ...getFiles(path.join(process.cwd(), 'backend', 'features')), 
    ...getFiles(path.join(process.cwd(), 'frontend', 'src'))
];

const globalFunctions = {}; // To map name to file and track called by
const functionsList = [];

for (let file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let ast;
    try {
        ast = parser.parse(content, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
    } catch (e) {
        console.error(`Error parsing ${file}: ${e.message}`);
        continue;
    }

    const relFile = path.relative(process.cwd(), file).replace(/\\/g, '/');
    let moduleGroup = relFile.split('/')[2]; 
    if (relFile.startsWith('frontend')) {
        moduleGroup = relFile.split('/')[2]; // src/something
    }

    traverse(ast, {
        enter(pathObj) {
            if (
                pathObj.isFunctionDeclaration() || 
                pathObj.isArrowFunctionExpression() || 
                pathObj.isFunctionExpression() || 
                pathObj.isClassMethod()
            ) {
                let name = '';
                if (pathObj.node.id) {
                    name = pathObj.node.id.name;
                } else if (pathObj.parentPath.isVariableDeclarator() && pathObj.parentPath.node.id.name) {
                    name = pathObj.parentPath.node.id.name;
                } else if (pathObj.parentPath.isAssignmentExpression() && pathObj.parentPath.node.left.property) {
                    name = pathObj.parentPath.node.left.property.name;
                } else if (pathObj.parentPath.isProperty() && pathObj.parentPath.node.key.name) {
                    name = pathObj.parentPath.node.key.name;
                } else if (pathObj.isClassMethod() && pathObj.node.key.name) {
                    name = pathObj.node.key.name;
                }

                if (!name || name === 'default') return;

                // get params
                const params = pathObj.node.params.map(p => {
                    if (p.type === 'Identifier') return `${p.name} (any)`;
                    if (p.type === 'ObjectPattern') return `{${p.properties.map(prop => prop.key?.name).join(', ')}} (object)`;
                    if (p.type === 'ArrayPattern') return `[array]`;
                    if (p.type === 'AssignmentPattern' && p.left.type === 'Identifier') return `${p.left.name} (optional)`;
                    return 'param (any)';
                });

                // determine type
                let type = 'Utility';
                if (relFile.includes('controller')) type = 'Controller';
                else if (relFile.includes('service')) type = 'Service';
                else if (relFile.includes('validator') || name.toLowerCase().includes('validate')) type = 'Validator';
                else if (relFile.includes('middleware') || name.toLowerCase().includes('middleware')) type = 'Middleware';
                else if (relFile.includes('components') || relFile.includes('screens')) type = 'React Component';
                else if (relFile.includes('hooks') || name.startsWith('use')) type = 'Hook';

                // determine returns
                let returns = new Set();
                pathObj.traverse({
                    ReturnStatement(retPath) {
                        if (!retPath.node.argument) returns.add('void');
                        else if (retPath.node.argument.type === 'JSXElement' || retPath.node.argument.type === 'JSXFragment') returns.add('JSX.Element');
                        else if (retPath.node.argument.type === 'ObjectExpression') returns.add('object');
                        else if (retPath.node.argument.type === 'ArrayExpression') returns.add('array');
                        else if (retPath.node.argument.type === 'StringLiteral') returns.add('string');
                        else if (retPath.node.argument.type === 'NumericLiteral') returns.add('number');
                        else if (retPath.node.argument.type === 'BooleanLiteral') returns.add('boolean');
                        else if (retPath.node.argument.type === 'Identifier') returns.add(`typeof ${retPath.node.argument.name}`);
                        else if (retPath.node.argument.type === 'CallExpression') returns.add(`result of ${retPath.node.argument.callee.name || 'call'}`);
                        else returns.add('any');
                    }
                });
                
                let returnStr = Array.from(returns).join(' | ') || 'void';

                // determine side effects
                let sideEffects = new Set();
                pathObj.traverse({
                    CallExpression(callPath) {
                        const callee = callPath.node.callee;
                        if (callee.type === 'MemberExpression') {
                            const objName = callee.object.name;
                            const propName = callee.property.name;
                            if ((objName === 'db' || objName === 'pool' || objName === 'client') && (propName === 'query' || propName === 'all' || propName === 'get' || propName === 'run')) sideEffects.add(`DB write/read via ${propName}`);
                            if (objName === 'localStorage' || objName === 'sessionStorage') sideEffects.add(`Mutates ${objName}`);
                            if (objName === 'console') return; // ignore
                            if (propName === 'dispatch') sideEffects.add('State dispatch');
                        }
                        if (callee.type === 'Identifier') {
                            const calleeName = callee.name;
                            if (calleeName === 'fetch') sideEffects.add('External API call (fetch)');
                            if (calleeName === 'axios') sideEffects.add('External API call (axios)');
                            if (calleeName && calleeName.startsWith('set') && /[A-Z]/.test(calleeName[3])) sideEffects.add(`State change (${calleeName})`);
                            if (calleeName === 'useNavigate') sideEffects.add('Navigation state change');
                            if (calleeName === 'useLocation') return;
                            if (calleeName === 'useContext') return;
                        }
                    }
                });
                let sideEffectsStr = Array.from(sideEffects).join(', ') || 'None';

                // determine calls
                let calls = new Set();
                pathObj.traverse({
                    CallExpression(callPath) {
                        const callee = callPath.node.callee;
                        if (callee.type === 'Identifier') {
                            calls.add(callee.name);
                        } else if (callee.type === 'MemberExpression') {
                            if (callee.object.name && callee.property.name) {
                                calls.add(`${callee.object.name}.${callee.property.name}`);
                            } else if (callee.property.name) {
                                calls.add(`${callee.property.name}`);
                            }
                        }
                    }
                });
                let callsStr = Array.from(calls).filter(c => c && !['console.log', 'console.error', 'map', 'filter', 'reduce', 'forEach', 'push', 'json', 'status', 'send'].includes(c)).join(', ') || 'None';

                // Purpose generation
                let purpose = `Executes the ${name} logic.`;
                let lowerName = name.toLowerCase();
                if (lowerName.startsWith('get')) purpose = `Retrieves data for ${name.substring(3)}.`;
                if (lowerName.startsWith('create')) purpose = `Creates a new ${name.substring(6)} record.`;
                if (lowerName.startsWith('update')) purpose = `Updates an existing ${name.substring(6)}.`;
                if (lowerName.startsWith('delete')) purpose = `Deletes a ${name.substring(6)} record.`;
                if (lowerName.startsWith('handle')) purpose = `Event handler for ${name.substring(6)}.`;
                if (type === 'React Component') purpose = `Renders the ${name} user interface component.`;

                const funcData = {
                    name,
                    file: relFile,
                    moduleGroup,
                    type,
                    purpose,
                    params: params.length > 0 ? params.join(', ') : 'none',
                    returns: returnStr,
                    sideEffects: sideEffectsStr,
                    calls: callsStr,
                    calledBy: []
                };

                functionsList.push(funcData);
                globalFunctions[name] = funcData;
            }
        }
    });
}

// Second pass to resolve "Called By"
for (let file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let ast;
    try { ast = parser.parse(content, { sourceType: 'module', plugins: ['jsx', 'typescript'] }); } catch (e) { continue; }
    
    const relFile = path.relative(process.cwd(), file).replace(/\\/g, '/');
    
    traverse(ast, {
        CallExpression(pathObj) {
            const callee = pathObj.node.callee;
            let calledName = null;
            if (callee.type === 'Identifier') {
                calledName = callee.name;
            } else if (callee.type === 'MemberExpression' && callee.property.name) {
                calledName = callee.property.name;
            }

            if (calledName && Object.prototype.hasOwnProperty.call(globalFunctions, calledName)) {
                // Find enclosing function to say who called it
                let callerName = 'Global/Route scope';
                let parent = pathObj.getFunctionParent();
                if (parent) {
                    if (parent.node.id) callerName = parent.node.id.name;
                    else if (parent.parentPath.isVariableDeclarator() && parent.parentPath.node.id.name) callerName = parent.parentPath.node.id.name;
                    else if (parent.parentPath.isProperty() && parent.parentPath.node.key.name) callerName = parent.parentPath.node.key.name;
                }
                
                if (!globalFunctions[calledName].calledBy.includes(callerName)) {
                    globalFunctions[calledName].calledBy.push(callerName);
                }
            }
        }
    });
}

// Group and format output
const grouped = {};
for (let f of functionsList) {
    if (!grouped[f.moduleGroup]) grouped[f.moduleGroup] = [];
    grouped[f.moduleGroup].push(f);
}

let out = '# SECTION 4 — FUNCTION REFERENCE\n\n';

for (let group in grouped) {
    out += `## Module: ${group}\n\n`;
    for (let f of grouped[group]) {
        out += `Function:    ${f.name}\n`;
        out += `File:        ${f.file}\n`;
        out += `Type:        ${f.type}\n`;
        out += `Purpose:     ${f.purpose}\n`;
        out += `Parameters:  ${f.params} — input arguments\n`;
        out += `Returns:     ${f.returns} — return value\n`;
        out += `Side effects: ${f.sideEffects}\n`;
        out += `Calls:       ${f.calls}\n`;
        out += `Called by:   ${f.calledBy.length > 0 ? f.calledBy.join(', ') : 'None'}\n\n`;
    }
}

fs.writeFileSync(path.join(process.cwd(), 'docs', '04_function_reference.md'), out);
console.log('Done generating docs/04_function_reference.md');
