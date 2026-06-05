exports.fetchStock = (ownerId) => {
    return {
        text: `
            SELECT 
                s.id as stock_id,
                pv.id as version_id,
                p.id as product_id,
                p.name as product_name,
                f.id as flavour_id,
                f.name as flavor,
                pv.vendor_price,
                pv.volume_points,
                COALESCE(s.quantity, 0) as qty
            FROM product_versions pv
            JOIN products p ON pv.product_id = p.id
            LEFT JOIN flavours f ON f.product_id = p.id AND f.is_active = true
            INNER JOIN stock s ON s.product_version_id = pv.id AND s.owner_id = $1
            WHERE p.owner_id = $1 AND pv.is_active = true
            ORDER BY p.name ASC
        `,
        values: [ownerId]
    };
};

exports.verifyProductOwnership = (variantId, ownerId) => {
    return {
        text: `
            SELECT pv.id, pv.vendor_price 
            FROM product_versions pv
            JOIN products p ON pv.product_id = p.id
            WHERE pv.id = $1 AND p.owner_id = $2 AND pv.is_active = true
        `,
        values: [variantId, ownerId]
    };
};

exports.updateStockRow = (quantity, vendorPriceSnap, variantId, ownerId) => {
    return {
        text: `
            UPDATE stock SET quantity = quantity + $1, vendor_price_snap = $2 
            WHERE product_version_id = $3 AND owner_id = $4 RETURNING id
        `,
        values: [quantity, vendorPriceSnap, variantId, ownerId]
    };
};

exports.insertStockRow = (variantId, ownerId, quantity, vendorPriceSnap, addedBy) => {
    return {
        text: `
            INSERT INTO stock (product_version_id, owner_id, quantity, vendor_price_snap, added_by)
            VALUES ($1, $2, $3, $4, $5)
        `,
        values: [variantId, ownerId, quantity, vendorPriceSnap, addedBy]
    };
};

exports.updateStockQuantityRow = (quantity, stockId, ownerId) => {
    return {
        text: `UPDATE stock SET quantity = $1 WHERE id = $2 AND owner_id = $3 RETURNING id`,
        values: [quantity, stockId, ownerId]
    };
};

exports.deleteStockRow = (stockId, ownerId) => {
    return {
        text: `DELETE FROM stock WHERE id = $1 AND owner_id = $2`,
        values: [stockId, ownerId]
    };
};
