const fs = require('fs');
const path = require('path');

// 1. Patch dashboardController.js
const dashFile = path.join(__dirname, 'controllers/dashboardController.js');
let dashContent = fs.readFileSync(dashFile, 'utf8');

dashContent = dashContent.replace(
    /exports\.clearAttendanceData = async \(req, res\) => \{\n    const \{ month \} = req\.body;/,
    `exports.clearAttendanceData = async (req, res) => {
    const { startDate, endDate } = req.body;`
);

dashContent = dashContent.replace(
    /        if \(month\) \{\n            query \+= " AND TO_CHAR\(date, 'YYYY-MM'\) = \$2";\n            params\.push\(month\);\n        \}/,
    `        if (startDate && endDate) {
            query += " AND date >= $2 AND date <= $3";
            params.push(startDate, endDate);
        }`
);

dashContent = dashContent.replace(
    /        res\.json\(\{ success: true, message: `Attendance data cleared successfully\$\{month \? ` for \$\{month\}` : ''\}\.` \}\);/,
    `        res.json({ success: true, message: \`Attendance data cleared successfully\${startDate ? \` from \${startDate} to \${endDate}\` : ''}.\` });`
);

dashContent = dashContent.replace(
    /exports\.clearSalesData = async \(req, res\) => \{\n    const \{ month \} = req\.body;/,
    `exports.clearSalesData = async (req, res) => {
    const { startDate, endDate } = req.body;`
);

dashContent = dashContent.replace(
    /        if \(month\) \{\n            saleQuery \+= " AND TO_CHAR\(date, 'YYYY-MM'\) = \\\$2";\n            saleParams\.push\(month\);\n            \n            itemQuery = "DELETE FROM sale_items WHERE owner_id = \\\$1 AND sale_id IN \(SELECT id FROM sales WHERE TO_CHAR\(date, 'YYYY-MM'\) = \\\$2 AND owner_id = \\\$3\)";\n            itemParams = \[ownerId, month, ownerId\];\n        \}/,
    `        if (startDate && endDate) {
            saleQuery += " AND date >= $2 AND date <= $3";
            saleParams.push(startDate, endDate);
            
            itemQuery = "DELETE FROM sale_items WHERE owner_id = $1 AND sale_id IN (SELECT id FROM sales WHERE date >= $2 AND date <= $3 AND owner_id = $4)";
            itemParams = [ownerId, startDate, endDate, ownerId];
        }`
);

dashContent = dashContent.replace(
    /        res\.json\(\{ success: true, message: `Sales data cleared successfully\$\{month \? ` for \$\{month\}` : ''\}\.` \}\);/,
    `        res.json({ success: true, message: \`Sales data cleared successfully\${startDate ? \` from \${startDate} to \${endDate}\` : ''}.\` });`
);

fs.writeFileSync(dashFile, dashContent, 'utf8');

// 2. Patch useStore.js
const storeFile = path.join(__dirname, '../frontend/src/store/useStore.js');
let storeContent = fs.readFileSync(storeFile, 'utf8');

storeContent = storeContent.replace(
    /    clearAttendanceData: async \(month\) => \{\n        try \{\n            const res = await api\.delete\('\/data-management\/attendance', \{ data: \{ month \} \}\);/,
    `    clearAttendanceData: async (startDate, endDate) => {
        try {
            const res = await api.delete('/data-management/attendance', { data: { startDate, endDate } });`
);

storeContent = storeContent.replace(
    /    clearSalesData: async \(month\) => \{\n        try \{\n            const res = await api\.delete\('\/data-management\/sales', \{ data: \{ month \} \}\);/,
    `    clearSalesData: async (startDate, endDate) => {
        try {
            const res = await api.delete('/data-management/sales', { data: { startDate, endDate } });`
);

fs.writeFileSync(storeFile, storeContent, 'utf8');

// 3. Patch DataManagement.jsx
const uiFile = path.join(__dirname, '../frontend/src/screens/DataManagement.jsx');
let uiContent = fs.readFileSync(uiFile, 'utf8');

uiContent = uiContent.replace(
    /    const \[monthFilterAtt, setMonthFilterAtt\] = useState\(''\);\n    const \[monthFilterSales, setMonthFilterSales\] = useState\(''\);/,
    `    const [startAtt, setStartAtt] = useState('');
    const [endAtt, setEndAtt] = useState('');
    const [startSales, setStartSales] = useState('');
    const [endSales, setEndSales] = useState('');`
);

uiContent = uiContent.replace(
    /                const res = await clearAttendanceData\(monthFilterAtt \|\| null\);/,
    `                const res = await clearAttendanceData(startAtt || null, endAtt || null);`
);

uiContent = uiContent.replace(
    /                const res = await clearSalesData\(monthFilterSales \|\| null\);/,
    `                const res = await clearSalesData(startSales || null, endSales || null);`
);

uiContent = uiContent.replace(
    /    const filterUsed = confirmAction === 'attendance' \? monthFilterAtt : monthFilterSales;\n    const recordsText = filterUsed \? `records for \$\{filterUsed\}` : 'ALL records';/,
    `    const recordsText = confirmAction === 'attendance' 
        ? (startAtt && endAtt ? \`records from \${startAtt} to \${endAtt}\` : 'ALL records')
        : (startSales && endSales ? \`records from \${startSales} to \${endSales}\` : 'ALL records');`
);

// Replace UI inputs for attendance
uiContent = uiContent.replace(
    /                        <label style=\{\{ display: 'block', fontSize: 12, fontWeight: 'bold', color: 'var\(--text-light\)', marginBottom: 5 \}\}>Optional: Filter by Month<\/label>\n                        <div style=\{\{ display: 'flex', alignItems: 'center', gap: 10 \}\}>\n                            <CalendarIcon size=\{16\} color="var\(--text-light\)" \/>\n                            <input \n                                type="month" \n                                value=\{monthFilterAtt\} \n                                onChange=\{\(e\) => setMonthFilterAtt\(e\.target\.value\)\} \n                                style=\{\{ flex: 1, padding: '8px 12px', border: '1px solid var\(--border-color\)', borderRadius: '6px' \}\}\n                            \/>\n                            \{monthFilterAtt && \(\n                                <button className="btn icon-btn" onClick=\{\(\) => setMonthFilterAtt\(''\)\} style=\{\{ padding: '8px' \}\}>\n                                    Clear\n                                <\/button>\n                            \)\}\n                        <\/div>/,
    `                        <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: 'var(--text-light)', marginBottom: 5 }}>Optional: Date Range</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CalendarIcon size={16} color="var(--text-light)" />
                            <input type="date" value={startAtt} onChange={(e) => setStartAtt(e.target.value)} style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                            <span>-</span>
                            <input type="date" value={endAtt} onChange={(e) => setEndAtt(e.target.value)} style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                            {(startAtt || endAtt) && (
                                <button className="btn icon-btn" onClick={() => { setStartAtt(''); setEndAtt(''); }} style={{ padding: '8px' }}>
                                    Clear
                                </button>
                            )}
                        </div>`
);

// Replace UI inputs for sales
uiContent = uiContent.replace(
    /                        <label style=\{\{ display: 'block', fontSize: 12, fontWeight: 'bold', color: 'var\(--text-light\)', marginBottom: 5 \}\}>Optional: Filter by Month<\/label>\n                        <div style=\{\{ display: 'flex', alignItems: 'center', gap: 10 \}\}>\n                            <CalendarIcon size=\{16\} color="var\(--text-light\)" \/>\n                            <input \n                                type="month" \n                                value=\{monthFilterSales\} \n                                onChange=\{\(e\) => setMonthFilterSales\(e\.target\.value\)\} \n                                style=\{\{ flex: 1, padding: '8px 12px', border: '1px solid var\(--border-color\)', borderRadius: '6px' \}\}\n                            \/>\n                            \{monthFilterSales && \(\n                                <button className="btn icon-btn" onClick=\{\(\) => setMonthFilterSales\(''\)\} style=\{\{ padding: '8px' \}\}>\n                                    Clear\n                                <\/button>\n                            \)\}\n                        <\/div>/,
    `                        <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: 'var(--text-light)', marginBottom: 5 }}>Optional: Date Range</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CalendarIcon size={16} color="var(--text-light)" />
                            <input type="date" value={startSales} onChange={(e) => setStartSales(e.target.value)} style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                            <span>-</span>
                            <input type="date" value={endSales} onChange={(e) => setEndSales(e.target.value)} style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                            {(startSales || endSales) && (
                                <button className="btn icon-btn" onClick={() => { setStartSales(''); setEndSales(''); }} style={{ padding: '8px' }}>
                                    Clear
                                </button>
                            )}
                        </div>`
);

fs.writeFileSync(uiFile, uiContent, 'utf8');

console.log("Patched DataManagement components.");
