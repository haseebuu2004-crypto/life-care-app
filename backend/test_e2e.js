require('dotenv').config();
const axios = require('axios');
const db = require('./shared/db/connection');

(async () => {
    try {
        const token = 'YOUR_BEARER_TOKEN'; // I need to get a token, or I can just use test_direct.js
    } catch(e) {
        console.error(e);
    }
})();
