const https = require('https');

const targetUrl = "https://life-care-app.onrender.com/api/inventory/entities";
const token = "session_token=c4910d9f2a505b05ddd1efc5a129dc2d6324540c3e3f09a495e6bdaa9f5e55b8";

const durationSeconds = 10;
const concurrency = 50;

let requestsSent = 0;
let responsesReceived = 0;
let errors = 0;
let totalLatency = 0;
const start = Date.now();
const endTime = start + (durationSeconds * 1000);

function sendRequest() {
    if (Date.now() >= endTime) return;

    const reqStart = Date.now();
    requestsSent++;
    
    https.get(targetUrl, {
        headers: { 'Cookie': token }
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            responsesReceived++;
            totalLatency += (Date.now() - reqStart);
            if (res.statusCode !== 200) {
                errors++;
                if (errors === 1) console.log("First error status:", res.statusCode, data);
            }
            sendRequest(); // immediately send next
        });
    }).on('error', (err) => {
        errors++;
        responsesReceived++;
        sendRequest();
    });
}

console.log(`Starting stress test: ${concurrency} concurrent users for ${durationSeconds} seconds...`);

for (let i = 0; i < concurrency; i++) {
    sendRequest();
}

const checkInterval = setInterval(() => {
    if (Date.now() >= endTime) {
        clearInterval(checkInterval);
        setTimeout(() => {
            const avgLatency = responsesReceived > 0 ? (totalLatency / responsesReceived).toFixed(2) : 0;
            const requestsPerSec = (responsesReceived / durationSeconds).toFixed(2);
            console.log("\n--- STRESS TEST RESULTS ---");
            console.log(`Total Requests Sent: ${requestsSent}`);
            console.log(`Total Responses Received: ${responsesReceived}`);
            console.log(`Total Errors (non-200 or failure): ${errors}`);
            console.log(`Average Response Time: ${avgLatency} ms`);
            console.log(`Requests / Second: ${requestsPerSec}`);
        }, 2000);
    }
}, 500);
