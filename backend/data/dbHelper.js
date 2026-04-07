const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'db.json');

function initializeDB() {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({
            base_products: [],
            product_flavors: [],
            sales: [],
            attendance: [],
            personal_tracking: []
        }, null, 2));
    }
}

function readDB() {
    initializeDB();
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
}

function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
