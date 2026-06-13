const http = require('http');

const request = (path, method, body) => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

(async () => {
    try {
        console.log("Requesting password reset...");
        const res1 = await request('/api/auth/forgot-password', 'POST', { email: 'haseebuu2004@gmail.com' });
        console.log("Forgot Password Response:", res1.status, res1.body);
        
        // Wait, how do I get the token? It is not returned in the API!
        // The API returns: { success: true, message: "If that email exists, reset instructions have been sent." }
        console.log("Since the API doesn't return the token, I will query the DB to get the latest token hash...");
        const db = require('./config/db');
        const userRes = await db.query("SELECT id FROM users WHERE email = 'haseebuu2004@gmail.com'");
        const userId = userRes.rows[0].id;
        
        const resetRes = await db.query("SELECT token_hash FROM password_resets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1", [userId]);
        const tokenHash = resetRes.rows[0].token_hash;
        console.log("Token Hash from DB:", tokenHash);
        
        // We can't reverse the hash. We need the raw token.
        // We must modify auth.controller.js to return the raw token temporarily, or just test using the service again.
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
})();
