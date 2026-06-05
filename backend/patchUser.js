const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'controllers/userController.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Update getUsers to select raw_password and decrypt it
content = content.replace(
    /        const users = await prisma\.user\.findMany\(\{[\s\S]*?            select: \{ id: true, username: true, role: true, email: true, authProvider: true, sessionToken: true, lastActiveAt: true \},[\s\S]*?            orderBy: \{ id: 'asc' \}[\s\S]*?        \}\);[\s\S]*?        res\.json\(\{ success: true, data: users \}\);/,
    `        const users = await prisma.user.findMany({
            where: { ownerId: ownerId },
            select: { id: true, username: true, role: true, email: true, authProvider: true, sessionToken: true, lastActiveAt: true, raw_password: true },
            orderBy: { id: 'asc' }
        });
        const { decrypt } = require('../utils/cryptoUtil');
        const mappedUsers = users.map(u => ({
            ...u,
            password_visible: u.raw_password ? decrypt(u.raw_password) : null,
            raw_password: undefined
        }));
        res.json({ success: true, data: mappedUsers });`
);

// 2. Update createUser to restrict role creation
content = content.replace(
    /        const ownerId = require\('\.\.\/middleware\/authMiddleware'\)\.getOwnerId\(req\);/,
    `        const ownerId = require('../middleware/authMiddleware').getOwnerId(req);
        
        let finalRole = role;
        if (req.user && req.user.role === 'admin') {
            finalRole = 'user'; // Admins can only create standard users
        }`
);

// Replace role references inside createUser
content = content.replace(
    /        if \(role === 'user'\) \{/g,
    `        if (finalRole === 'user') {`
);

content = content.replace(
    /                    role,\n                    ownerId/g,
    `                    role: finalRole,
                    ownerId`
);

content = content.replace(
    /res\.json\(\{ success: true, data: \{ id: newUser\.id, username, email: userEmail, role \} \}\);/g,
    `res.json({ success: true, data: { id: newUser.id, username, email: userEmail, role: finalRole } });`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched userController.js");
