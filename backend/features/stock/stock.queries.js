exports.fetchStock = (ownerId) => {
    return {
        text: `
            SELECT 
                s.id as stock_id,
                pv.id as version_id,
                p.id as product_id,
                p.name as product_name,
                v.id as variant_id,
                v.name as flavor,
                pv.version_label,
                pv.vendor_price,
                pv.volume_points,
                COALESCE(s.quantity, 0) as qty
            FROM product_versions pv
            JOIN products p ON pv.product_id = p.id
            INNER JOIN stock s ON s.product_version_id = pv.id AND s.owner_id = $1
            JOIN variants v ON s.variant_id = v.id
            WHERE p.owner_id = $1 AND pv.is_active = true
            ORDER BY p.name ASC, v.name ASC
        `,
        values: [ownerId]
    };
};

exports.verifyProductOwnership = (variantId, ownerId) => {
    return {
        text: `
            SELECT pv.id as version_id, pv.vendor_price 
            FROM variants v
            JOIN product_versions pv ON v.product_version_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE v.id = $1 AND p.owner_id = $2 AND pv.is_active = true
            LIMIT 1
        `,
        values: [variantId, ownerId]
    };
};

exports.updateStockRow = (quantity, vendorPriceSnap, variantId, versionId, ownerId) => {
    return {
        text: `
            UPDATE stock SET quantity = quantity + $1, vendor_price_snap = $2 
            WHERE variant_id = $3 AND product_version_id = $4 AND owner_id = $5 RETURNING id
        `,
        values: [quantity, vendorPriceSnap, variantId, versionId, ownerId]
    };
};

exports.insertStockRow = (variantId, versionId, ownerId, quantity, vendorPriceSnap, addedBy) => {
    return {
        text: `
            INSERT INTO stock (id, product_version_id, variant_id, owner_id, quantity, vendor_price_snap, added_by, added_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
        `,
        values: [versionId, variantId, ownerId, quantity, vendorPriceSnap, addedBy]
    };
};

exports.updateStockQuantityRow = (quantity, variantId, ownerId) => {
    return {
        text: `UPDATE stock SET quantity = $1 WHERE variant_id = $2 AND owner_id = $3 RETURNING id`,
        values: [quantity, variantId, ownerId]
    };
};

exports.deleteStockRow = (variantId, ownerId) => {
    return {
        text: `DELETE FROM stock WHERE variant_id = $1 AND owner_id = $2`,
        values: [variantId, ownerId]
    };
};
