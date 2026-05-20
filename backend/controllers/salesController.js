const salesService = require('../services/salesService');

exports.getSales = async (req, res) => {
    try {
        const rows = await salesService.getAllSales();
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addSale = async (req, res) => {
    try {
        const { customerName, date, products } = req.body;
        
        if (!products || products.length === 0) return res.status(400).json({ success: false, message: "No products provided" });
        
        // Aggregate identical products
        const mergedProducts = {};
        products.forEach(p => {
            if (mergedProducts[p.stock_id]) {
                mergedProducts[p.stock_id].quantity += p.quantity;
                mergedProducts[p.stock_id].total_amount += (p.sellingPrice * p.quantity);
                mergedProducts[p.stock_id].profit += p.profit;
            } else {
                mergedProducts[p.stock_id] = {
                    stock_id: p.stock_id,
                    quantity: p.quantity,
                    sale_price: p.sellingPrice,
                    total_amount: p.sellingPrice * p.quantity,
                    profit: p.profit
                };
            }
        });
        
        const uniqueProducts = Object.values(mergedProducts);
        await salesService.addSaleTransaction(date, customerName, uniqueProducts);
        res.json({ success: true, data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSale = async (req, res) => {
    try {
        await salesService.deleteSaleTransaction(req.params.id);
        res.json({ success: true, message: "Sale deleted successfully", data: null });
    } catch (error) {
        if (error.message === "Sale not found") {
            return res.status(404).json({ success: false, message: "Sale not found" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
