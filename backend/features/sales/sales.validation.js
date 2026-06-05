const { z } = require('zod');

// Migrated exactly from schemas/apiSchemas.js -> addSaleSchema
exports.addSaleSchema = {
    body: z.object({
        customer_id: z.string().uuid("Invalid customer ID").optional().nullable(),
        customer_name: z.string().optional().nullable(),
        sale_date: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date" }),
        items: z.array(z.object({
            product_version_id: z.string().uuid("Invalid product version ID"),
            flavour_id: z.string().uuid("Invalid flavour ID").optional().nullable(),
            quantity: z.number().int().positive("Quantity must be positive"),
            price_charged: z.number().int().nonnegative("Price charged must be non-negative"),
            standard_price_snap: z.number().int().nonnegative("Standard price snap must be non-negative"),
            vendor_price_snap: z.number().int().nonnegative("Vendor price snap must be non-negative")
        })).min(1, "At least one item is required")
    })
};

// Inline validation from salesController.addSale lines 104-105
exports.validateAddSaleInline = (req, res, next) => {
    const { customer_id, customer_name, items } = req.body;
    if (!customer_id && !customer_name) {
        return res.status(400).json({ success: false, message: "Valid customer is required" });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: "No items provided" });
    }
    next();
};
