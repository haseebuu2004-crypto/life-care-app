const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/screens/UserManagement.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add revealed state
content = content.replace(
    /    const \[showPassword, setShowPassword\] = useState\(false\);/,
    `    const [showPassword, setShowPassword] = useState(false);
    const [revealedPasswords, setRevealedPasswords] = useState({});
    
    const toggleReveal = (id) => {
        setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };`
);

// 2. Update the Password column to have a reveal button
content = content.replace(
    /                                        <td style=\{\{ fontFamily: 'monospace', color: '#dc2626', fontWeight: 600 \}\}>\n                                            \{u\.raw_password \|\| '\*\*\*\*\*\*\*\*'\}\n                                        <\/td>/,
    `                                        <td style={{ fontFamily: 'monospace', color: '#dc2626', fontWeight: 600 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {revealedPasswords[u.id] ? (u.password_visible || '********') : '********'}
                                                {u.password_visible && (
                                                    <button type="button" onClick={() => toggleReveal(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}>
                                                        {revealedPasswords[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched UserManagement.jsx");
