/**
 * inventory.dto.js
 * 
 * IMPLEMENTATION GOVERNANCE RULE:
 * This Canonical Inventory Entity DTO is the ONLY approved inventory representation.
 * All modules (Product Manager, Stock, Sales, Reports, Search) MUST consume this DTO.
 */

exports.mapToInventoryEntity = (row) => {
    const productName = row.product_name || 'Unknown Product';
    // If flavor is 'Standard' or similar and there are no other variants, we could just show the product name.
    // However, the rule states "Formula 1 | Mango". For consistency, if it has a flavor, append it.
    const variantName = row.variant_name;
    
    // We trim to ensure clean display
    const cleanProductName = productName.trim();
    const cleanVariantName = (variantName && variantName.trim()) ? variantName.trim() : 'Standard';

    let displayName = cleanProductName;
    if (cleanVariantName && cleanVariantName.toLowerCase() !== 'standard') {
        displayName = `${cleanProductName} | ${cleanVariantName}`;
    }

    return {
        inventoryId: row.variant_id, // The universal identifier for stock/sales
        variantId: row.variant_id,
        productId: row.product_id,
        productVersionId: row.product_version_id,
        name: displayName,
        productName: cleanProductName,
        variantName: cleanVariantName,
        displayName: displayName,
        sku: row.sku,
        vendorPrice: row.vendor_price ? parseFloat(row.vendor_price) / 100 : 0, // Assuming vendor_price is in paise
        vp: row.volume_points ? parseFloat(row.volume_points) : 0,
        stock: row.stock_quantity ? parseInt(row.stock_quantity, 10) : 0,
        isActive: row.is_active === null ? true : row.is_active, // Default active
        lowStockThreshold: row.low_stock_threshold ? parseInt(row.low_stock_threshold, 10) : 0,
        alertEnabled: row.alert_enabled === null ? true : row.alert_enabled,
        hasStockRecord: !!row.stock_id
    };
};
