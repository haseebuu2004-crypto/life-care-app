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
        email: z.string().min(1, "Email/Username is required"),
        password: z.string().min(1, "Password is required")
    })
};

// --- PRODUCTS ---
exports.addProductSchema = {
    body: z.object({
        name: z.string().min(1, "Product name required"),
        vendor_price: z.union([z.number(), z.string()]).optional(),
        vp: z.union([z.number(), z.string()]).optional(),
        flavor: z.string().optional(),
        volume_points: z.union([z.number(), z.string()]).optional(),
        version_label: z.string().optional()
    }).refine(data => data.vendor_price !== undefined || data.vp !== undefined, {
        message: "Vendor price is required",
        path: ["vendor_price"]
    })
};

exports.updateProductPriceSchema = {
    params: z.object({
        id: z.string().regex(/^\d+$/, "Invalid Product ID")
    }),
    body: z.object({
        vendor_price: z.union([z.number(), z.string()], { required_error: "Vendor price is required" }),
        version_label: z.string().optional()
    })
};

exports.addVariantSchema = {
    body: z.object({
        name: z.string().min(1, "Variant/Flavour name is required"),
        product_id: z.union([z.number(), z.string()]).optional(),
        product_version_id: z.union([z.number(), z.string()]).optional()
    }).refine(data => data.product_id !== undefined || data.product_version_id !== undefined, {
        message: "Product ID or Product Version ID is required",
        path: ["product_id"]
    })
};

exports.toggleStatusSchema = {
    params: z.object({
        id: z.string().regex(/^\d+$/, "Invalid ID")
    })
};
