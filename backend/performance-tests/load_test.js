const autocannon = require('autocannon');
const axios = require('axios');

async function runTest() {
    console.log("Authenticating...");
    let cookie = "";
    try {
        const res = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'hasieeyy4444@gmail.com',
            password: '12345678'
        });
        cookie = res.headers['set-cookie'][0].split(';')[0];
        console.log("Got session cookie:", cookie);
    } catch (e) {
        console.log("Failed to login:", e.message);
        return;
    }

    console.log("\nStarting Load Test (100 concurrent connections, 10 seconds)...");
    const instance = autocannon({
        url: 'http://localhost:3000/api/dashboard/stats',
        connections: 100,
        duration: 10,
        headers: {
            'Cookie': cookie
        }
    }, console.log);

    autocannon.track(instance);
}

runTest();
