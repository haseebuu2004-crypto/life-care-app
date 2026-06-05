const salesController = require('./controllers/salesController');
salesController.addSale = async (req, res) => {
    console.log("REACHED ADDSALE:", JSON.stringify(req.body, null, 2));
    // ... rest of the code is not needed, just intercept it.
    res.json({ success: true });
}
