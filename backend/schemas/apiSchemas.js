const { z } = require('zod');

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

exports.addAttendanceSchema = {
    body: z.object({
        customerId: z.string().uuid("Invalid customer ID").optional().nullable(),
        customerName: z.string().optional().nullable(),
        date: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date" }),
        type: z.enum(['default', 'custom', 'DEFAULT', 'CUSTOM']).transform(val => val.toLowerCase()),
        shakeProfit: z.number().nonnegative("Shake amount must be non-negative").optional()
    })
};

exports.loginSchema = {
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required")
    })
};
