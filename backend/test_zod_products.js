const express = require('express');
const request = require('supertest');
const validate = require('./shared/middleware/validate');
const { addProductSchema, updateProductPriceSchema, addVariantSchema, toggleStatusSchema } = require('./schemas/apiSchemas');

const app = express();
app.use(express.json());

// Dummy controller
const dummy = (req, res) => res.json({ success: true, message: "Passed" });

app.post('/products', validate(addProductSchema), dummy);
app.put('/products/:id/price', validate(updateProductPriceSchema), dummy);
app.post('/variants', validate(addVariantSchema), dummy);
app.put('/variants/:id/toggle', validate(toggleStatusSchema), dummy);

async function run() {
    console.log("--- Testing addProductSchema ---");
    let res = await request(app).post('/products').send({ name: "" }); // Missing vendor_price
    console.log("Missing vendor_price -> Status:", res.status, "Message:", res.body?.error?.message);
    
    res = await request(app).post('/products').send({ name: "Tea", vendor_price: 100 });
    console.log("Valid product -> Status:", res.status, "Message:", res.body.message);

    console.log("\n--- Testing updateProductPriceSchema ---");
    res = await request(app).put('/products/abc/price').send({ vendor_price: 150 });
    console.log("Invalid ID string -> Status:", res.status, "Message:", res.body?.error?.message);

    res = await request(app).put('/products/123/price').send({});
    console.log("Missing price -> Status:", res.status, "Message:", res.body?.error?.message);

    res = await request(app).put('/products/123/price').send({ vendor_price: 150 });
    console.log("Valid update -> Status:", res.status, "Message:", res.body.message);

    console.log("\n--- Testing addVariantSchema ---");
    res = await request(app).post('/variants').send({ name: "", product_id: 1 });
    console.log("Empty name -> Status:", res.status, "Message:", res.body?.error?.message);

    res = await request(app).post('/variants').send({ name: "Vanilla" });
    console.log("Missing product_id -> Status:", res.status, "Message:", res.body?.error?.message);
}

run().catch(console.error);
