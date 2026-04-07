const { readDB, writeDB } = require('../data/dbHelper');
const { v4: uuidv4 } = require('uuid');

function getStock() {
    const db = readDB();
    return {
        base_products: db.base_products || [],
        product_flavors: db.product_flavors || []
    };
}

function updateStockQty(flavorId, baseId, newQty) {
    if (newQty < 0) newQty = 0;
    const db = readDB();
    
    const fIndex = db.product_flavors.findIndex(f => f.id === flavorId);
    if (fIndex === -1) return false;
    
    const diff = newQty - db.product_flavors[fIndex].qty;
    db.product_flavors[fIndex].qty = newQty;
    
    const bIndex = db.base_products.findIndex(b => b.id === baseId);
    if (bIndex !== -1) {
        db.base_products[bIndex].totalQty += diff;
    }
    
    writeDB(db);
    return true;
}

function addProduct(name, flavor, vp, sp, qty) {
    const db = readDB();
    const lName = name.trim().toLowerCase();
    
    let base = db.base_products.find(b => b.name.toLowerCase() === lName);
    if (!base) {
        base = { id: uuidv4(), name: name.trim(), totalQty: 0 };
        db.base_products.push(base);
    }

    const flavName = (flavor || "Base").trim();
    const lFlav = flavName.toLowerCase();
    
    let flav = db.product_flavors.find(f => f.productId === base.id && f.flavor.toLowerCase() === lFlav);
    if (flav) {
        flav.qty += qty;
        flav.vp = vp;
        flav.sp = sp;
    } else {
        flav = { id: uuidv4(), productId: base.id, flavor: flavName, vp: vp, sp: sp, qty: qty };
        db.product_flavors.push(flav);
    }
    
    base.totalQty += qty;
    writeDB(db);
    return getStock();
}

function deleteProduct(type, id) {
    const db = readDB();
    if (type === 'base') {
        db.base_products = db.base_products.filter(b => b.id !== id);
        db.product_flavors = db.product_flavors.filter(f => f.productId !== id);
    } else if (type === 'flavor') {
        const flavIndex = db.product_flavors.findIndex(f => f.id === id);
        if (flavIndex !== -1) {
            const flav = db.product_flavors[flavIndex];
            const baseIndex = db.base_products.findIndex(b => b.id === flav.productId);
            if (baseIndex !== -1) {
                db.base_products[baseIndex].totalQty -= flav.qty;
            }
            db.product_flavors.splice(flavIndex, 1);
        }
    }
    writeDB(db);
    return getStock();
}

module.exports = { getStock, updateStockQty, addProduct, deleteProduct };
