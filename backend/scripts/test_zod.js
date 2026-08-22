const { addSaleSchema } = require('./schemas/apiSchemas');

const payload = {
  customer_id: 'cee8b16c-ba99-447c-84ce-116ad75f6cf5',
  sale_date: '2026-06-01',
  items: [
    {
      product_version_id: '50b90757-d1f1-4bbd-bbf1-8a4b339323d3',
      flavour_id: null,
      quantity: 2,
      price_charged: 11000,
      standard_price_snap: 13000,
      vendor_price_snap: 8000
    }
  ]
};

try {
  addSaleSchema.body.parse(payload);
  console.log("Success!");
} catch (e) {
  console.error(e.errors);
}
process.exit(0);
