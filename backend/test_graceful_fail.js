process.env.DATABASE_URL = 'postgresql://postgres:badpassword@localhost:1234/baddb';
process.env.SUPABASE_DATABASE_URL = 'postgresql://postgres:badpassword@localhost:1234/baddb';

const request = require('supertest');
const app = require('./server'); // This requires server.js

async function run() {
    console.log("Simulating DB down (bad connection string)...");
    
    // We expect this to take ~7 seconds because of retries:
    // try 1 -> fail, 1s delay
    // try 2 -> fail, 2s delay
    // try 3 -> fail, 4s delay
    // try 4 (last attempt) -> fail, throws.
    // Total delay = 7s. Plus connection timeout (5s) per attempt? 
    // Actually the connection timeout is 5s, so each attempt might take up to 5s if the port is a black hole.
    // Since we're using localhost:1234 which probably actively refuses the connection, it should fail fast (ECONNREFUSED).
    
    const startTime = Date.now();
    const res = await request(app).post('/api/auth/login').send({ email: "test@test.com", password: "test" });
    const elapsed = Date.now() - startTime;
    
    console.log(`\nRequest took ${elapsed}ms`);
    console.log(`Response Status: ${res.status}`);
    console.log(`Response Body:`, res.body);
    
    if (res.status === 500) {
        console.log("SUCCESS: App failed gracefully without crashing!");
    } else {
        console.log("WARNING: App did not return 500 as expected.");
    }
}

run().then(() => process.exit(0)).catch(e => {
    console.error("Test failed with exception:", e);
    process.exit(1);
});
