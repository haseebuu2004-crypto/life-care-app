const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'controllers/authController.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the login history insert to include username, role, device, and browser
content = content.replace(
    /        const insertRes = await prisma\.loginHistory\.create\(\{\n            data: \{\n                userId: user\.id,\n                userAgent: ua,\n                ipAddress: ip\n            \}\n        \}\);/,
    `        const getDevice = (u) => /mobile/i.test(u) ? 'Mobile' : 'Desktop';
        const getBrowser = (u) => {
            if (/edg/i.test(u)) return 'Edge';
            if (/chrome/i.test(u)) return 'Chrome';
            if (/safari/i.test(u)) return 'Safari';
            if (/firefox/i.test(u)) return 'Firefox';
            return 'Other';
        };

        const insertRes = await prisma.loginHistory.create({
            data: {
                userId: user.id,
                username: user.username,
                role: user.role,
                device: getDevice(ua),
                browser: getBrowser(ua),
                userAgent: ua,
                ipAddress: ip
            }
        });`
);

// 2. Fix the getLoginHistory return format
content = content.replace(
    /        const data = await prisma\.loginHistory\.findMany\(\{\n            where: \{ userId: \{ in: userIds \} \},\n            orderBy: \{ loginTime: 'desc' \},\n            take: 100\n        \}\);\n        res\.json\(\{ success: true, data \}\);/,
    `        const data = await prisma.loginHistory.findMany({
            where: { userId: { in: userIds } },
            orderBy: { loginTime: 'desc' },
            take: 100
        });

        const mappedData = data.map(h => ({
            id: h.id,
            username: h.username || 'Unknown',
            role: h.role || 'user',
            device: h.device || 'Desktop',
            browser: h.browser || 'Unknown',
            login_time: h.loginTime,
            logout_time: h.logoutTime,
            ip: h.ipAddress
        }));

        res.json({ success: true, data: mappedData });`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched authController.js");
