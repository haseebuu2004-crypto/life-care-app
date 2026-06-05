const stock = [
  {
    id: "efd230f5-2fc4-4eb0-873b-384c8f9a5710_5bd722e8-1d12-4475-b172-23e4c1d20572",
    version_id: "efd230f5-2fc4-4eb0-873b-384c8f9a5710",
    flavour_id: "5bd722e8-1d12-4475-b172-23e4c1d20572",
    product_name: "f1",
    flavor: "MANGO",
    vendor_price: 80,
    qty: 2
  }
];

const items = [
  { stock_id: "efd230f5-2fc4-4eb0-873b-384c8f9a5710_5bd722e8-1d12-4475-b172-23e4c1d20572", qty: 3, sellingPrice: 100 }
];

const itemsPayload = items.map(i => {
    const s = stock.find(st => st.id === i.stock_id);
    return {
        product_version_id: s?.version_id,
        flavour_id: s?.flavour_id,
        quantity: parseInt(i.qty) || 1,
        price_charged: Math.round(i.sellingPrice * 100),
        standard_price_snap: 0,
        vendor_price_snap: Math.round((s?.vendor_price || 0) * 100)
    };
});

console.log(JSON.stringify(itemsPayload, null, 2));
