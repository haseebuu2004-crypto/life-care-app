const { readDB, writeDB } = require('../data/dbHelper');
const { v4: uuidv4 } = require('uuid');

function getSales() {
    const db = readDB();
    // sort descending by date (or let frontend do it, but we can do it here roughly)
    const sales = db.sales || [];
    return sales.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
}

function addSale(date, customer, prodSearch, flavorSearch, qty, salePrice) {
    const db = readDB();
    const bases = db.base_products || [];
    const flavors = db.product_flavors || [];

    const lowSearch = (str) => (str ? str.toLowerCase() : "");
    const ps = lowSearch(prodSearch);
    const fs = lowSearch(flavorSearch);

    let matchingFlavs = [];
    if (ps && fs) {
        const b = bases.find(x => lowSearch(x.name) === ps);
        if (b) matchingFlavs = flavors.filter(f => f.productId === b.id && lowSearch(f.flavor) === fs);
    } else if (!ps && fs) {
        matchingFlavs = flavors.filter(f => lowSearch(f.flavor) === fs);
    } else if (ps && !fs) {
        const b = bases.find(x => lowSearch(x.name) === ps);
        if (b) matchingFlavs = flavors.filter(f => f.productId === b.id);
    }

    if (matchingFlavs.length === 0) throw new Error("Product/Flavour not found in Stock!");
    const totalAvail = matchingFlavs.reduce((sum, f) => sum + f.qty, 0);
    if (totalAvail < qty) throw new Error(`Insufficient stock! Only ${totalAvail} available.`);

    const baseObj = bases.find(b => b.id === matchingFlavs[0].productId);
    let finalName = baseObj ? baseObj.name : "Unknown";
    let finalFlavor = flavorSearch ? matchingFlavs[0].flavor : (matchingFlavs.length === 1 ? matchingFlavs[0].flavor : "Various");

    let qtyToReduce = qty;
    let totalCost = 0;
    let totalVp = 0;
    let reductions = [];

    for (let i = 0; i < matchingFlavs.length; i++) {
        if (qtyToReduce <= 0) break;
        const item = matchingFlavs[i];
        const reduceAmt = Math.min(item.qty, qtyToReduce);

        // Deduct from flavor
        item.qty -= reduceAmt;

        // Deduct from base
        const bIndex = bases.findIndex(b => b.id === item.productId);
        if (bIndex !== -1) {
            bases[bIndex].totalQty -= reduceAmt;
        }

        totalCost += (reduceAmt * item.sp);
        totalVp += (reduceAmt * item.vp);
        qtyToReduce -= reduceAmt;
        reductions.push({ id: item.id, baseId: item.productId, qty: reduceAmt });
    }

    const totalAmount = qty * salePrice;
    const totalProfit = totalAmount - totalCost;

    const newSale = {
        id: uuidv4(),
        date,
        customer,
        productId: matchingFlavs[0].productId,
        saleProdName: finalName,
        saleFlavorName: finalFlavor,
        qty,
        totalAmount,
        profit: totalProfit,
        vp: totalVp,
        reductions: reductions,
        createdAt: new Date().toISOString()
    };

    if (!db.sales) db.sales = [];
    db.sales.push(newSale);

    writeDB(db);
    return newSale;
}

function deleteSale(id) {
    const db = readDB();
    if (!db.sales) return [];
    db.sales = db.sales.filter(s => s.id !== id);
    writeDB(db);
    return getSales();
}

module.exports = { getSales, addSale, deleteSale };
