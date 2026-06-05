const fs = require('fs');
const path = require('path');

// 1. Patch masterController.js
const masterFile = path.join(__dirname, 'controllers/masterController.js');
let masterContent = fs.readFileSync(masterFile, 'utf8');

masterContent = masterContent.replace(
    /        const sessions = await prisma\.loginHistory\.findMany\(\{\n            where: \{ logoutTime: null \},\n            orderBy: \{ loginTime: 'desc' \}\n        \}\);/,
    `        const sessions = await prisma.loginHistory.findMany({
            orderBy: { loginTime: 'desc' },
            take: 200
        });`
);

masterContent = masterContent.replace(
    /                    loginTime: s\.loginTime,\n                    userAgent: s\.userAgent,\n                    ipAddress: s\.ipAddress/,
    `                    loginTime: s.loginTime,
                    logoutTime: s.logoutTime,
                    device: s.device || 'Desktop',
                    browser: s.browser || 'Unknown',
                    userAgent: s.userAgent,
                    ipAddress: s.ipAddress`
);

fs.writeFileSync(masterFile, masterContent, 'utf8');

// 2. Patch MasterDashboard.jsx
const uiFile = path.join(__dirname, '../frontend/src/screens/MasterDashboard.jsx');
let uiContent = fs.readFileSync(uiFile, 'utf8');

// Change Title
uiContent = uiContent.replace(
    /<h3 style=\{\{ margin: 0, fontSize: '18px' \}\}>Live Active Sessions<\/h3>/,
    `<h3 style={{ margin: 0, fontSize: '18px' }}>Global Session History (Active & Ended)</h3>`
);

// Add Logout Time and Status columns to table header
uiContent = uiContent.replace(
    /                            <th style=\{\{ padding: '12px', color: '#4b5563' \}\}>Login Time<\/th>\n                            <th style=\{\{ padding: '12px', color: '#4b5563' \}\}>IP Address<\/th>\n                            <th style=\{\{ padding: '12px', color: '#4b5563' \}\}>Device \/ Browser<\/th>/,
    `                            <th style={{ padding: '12px', color: '#4b5563' }}>Login Time</th>
                            <th style={{ padding: '12px', color: '#4b5563' }}>Logout Time</th>
                            <th style={{ padding: '12px', color: '#4b5563' }}>IP Address</th>
                            <th style={{ padding: '12px', color: '#4b5563' }}>Device / Browser</th>
                            <th style={{ padding: '12px', color: '#4b5563' }}>Status</th>`
);

// Add columns to rows
uiContent = uiContent.replace(
    /                                <td style=\{\{ padding: '12px', color: '#4b5563', fontSize: 13 \}\}>\n                                    \{new Date\(s\.loginTime\)\.toLocaleString\(\)\}\n                                <\/td>\n                                <td style=\{\{ padding: '12px', fontFamily: 'monospace', color: '#4b5563' \}\}>\n                                    \{s\.ipAddress \|\| 'Unknown'\}\n                                <\/td>\n                                <td style=\{\{ padding: '12px', color: '#6b7280', fontSize: 12, maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' \}\} title=\{s\.userAgent\}>\n                                    \{s\.userAgent \|\| 'Unknown'\}\n                                <\/td>/,
    `                                <td style={{ padding: '12px', color: '#4b5563', fontSize: 13 }}>
                                    {new Date(s.loginTime).toLocaleString()}
                                </td>
                                <td style={{ padding: '12px', color: '#4b5563', fontSize: 13 }}>
                                    {s.logoutTime ? new Date(s.logoutTime).toLocaleString() : '—'}
                                </td>
                                <td style={{ padding: '12px', fontFamily: 'monospace', color: '#4b5563' }}>
                                    {s.ipAddress || 'Unknown'}
                                </td>
                                <td style={{ padding: '12px', color: '#6b7280', fontSize: 12 }}>
                                    {s.device} / {s.browser}
                                </td>
                                <td style={{ padding: '12px', fontSize: 13 }}>
                                    {s.logoutTime 
                                        ? <span style={{ color: '#6b7280' }}>Ended</span> 
                                        : <span style={{ color: '#10b981', fontWeight: 'bold' }}>● Active</span>}
                                </td>`
);

uiContent = uiContent.replace(
    /<td colSpan="5" style=\{\{ padding: 30, textAlign: 'center', color: '#6b7280' \}\}>/,
    `<td colSpan="7" style={{ padding: 30, textAlign: 'center', color: '#6b7280' }}>`
);

fs.writeFileSync(uiFile, uiContent, 'utf8');
console.log("Patched MasterDashboard successfully.");
