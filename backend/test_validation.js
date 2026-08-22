const express = require('express');
const request = require('supertest');
const productValidation = require('./features/products/products.validation');

const app = express();
app.use(express.json());

app.post('/test-variant', productValidation.validateAddFlavour, (req, res) => {
    res.json({ success: true, message: "Passed validation" });
});

async function run() {
    console.log("--- Testing validateAddFlavour ---");
    const res1 = await request(app).post('/test-variant').send({ name: "", product_id: 1 });
    console.log("Empty name test -> Status:", res1.status, "Body:", res1.body);

    const res2 = await request(app).post('/test-variant').send({ name: "Vanilla" });
    console.log("Missing product_id test -> Status:", res2.status, "Body:", res2.body);

    const res3 = await request(app).post('/test-variant').send({ name: "Vanilla", product_id: 1 });
    console.log("Valid request test -> Status:", res3.status, "Body:", res3.body);
}

run().catch(console.error);
