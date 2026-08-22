const db = require('./db');

async function testMaster() {
    try {
        const res = await db.query("SELECT email FROM users WHERE role='master' LIMIT 1");
        if (res.rows.length > 0) {
            console.log("Master email:", res.rows[0].email);
        } else {
            console.log("No master user found. Creating one...");
            const hash = "$2a$12$N9/Q8H1b2zPjD3U4j9VjJOfgZ5QxTXZ3v/U7uR6LwB5hFqN6I7/qS"; // hashed "password"
            await db.query("INSERT INTO users (email, password_hash, role, is_active) VALUES ('testmaster@test.com', $1, 'master', true)", [hash]);
            console.log("Created master user: testmaster@test.com");
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

testMaster();
