const dotenv = require('dotenv');
dotenv.config();
const db = require('./shared/db/connection');
const dashboardController = require('./features/dashboard/dashboard.controller');

async function testEndpoint() {
    console.log("Mocking req/res to test getStats endpoint...");
    
    const userRes = await db.query('SELECT id, owner_id FROM users LIMIT 1');
    const user = userRes.rows[0];
    console.log("Using user:", user.id);
    
    const req = {
        user: { id: user.id, owner_id: user.owner_id || user.id },
        query: {}
    };
    
    const res = {
        json: (data) => {
            console.log("\n--- RESPONSE PAYLOAD ---");
            console.log(JSON.stringify(data, null, 2));
            console.log("------------------------\n");
            process.exit(0);
        },
        status: (code) => {
            return {
                json: (data) => {
                    console.log(`\n--- ERROR RESPONSE (Status ${code}) ---`);
                    console.log(JSON.stringify(data, null, 2));
                    console.log("------------------------------------\n");
                    process.exit(1);
                }
            };
        }
    };

    try {
        await dashboardController.getStats(req, res);
    } catch (e) {
        console.error("Endpoint threw an unhandled error:", e);
        process.exit(1);
    }
}

testEndpoint();
