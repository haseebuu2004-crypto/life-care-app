const prisma = require('../config/prisma');

async function main() {
    console.log("Starting stock migration...");
    
    // 1. Fetch all stock records
    const stocks = await prisma.stock.findMany();
    
    // 2. Fetch all sale items to calculate total sold per variant
    const saleItems = await prisma.saleItem.findMany();
    
    const soldPerVariant = {};
    for (const item of saleItems) {
        if (!soldPerVariant[item.variantId]) {
            soldPerVariant[item.variantId] = 0;
        }
        soldPerVariant[item.variantId] += item.qty;
    }
    
    // 3. Create stock_entries
    for (const stock of stocks) {
        const totalSold = soldPerVariant[stock.variantId] || 0;
        const totalAddedNeeded = stock.qty + totalSold;
        
        if (totalAddedNeeded > 0) {
            await prisma.stockEntry.create({
                data: {
                    ownerId: stock.ownerId,
                    variantId: stock.variantId,
                    quantityAdded: totalAddedNeeded,
                    purchasePrice: 0, // Legacy stock doesn't have purchase price
                    addedBy: 'Migration Script'
                }
            });
            console.log(`Created StockEntry for variant ${stock.variantId}: +${totalAddedNeeded} (to balance ${stock.qty} current and ${totalSold} sold)`);
        }
    }
    
    console.log("Migration complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
