const db = require('../../shared/db/connection');

exports.getProducts = (ownerId) => {
    return db.query(`
        SELECT 
            p.id as product_id, 
            p.name as product_name,
            pv.id as version_id,
            pv.vendor_price,
            pv.volume_points,
            pv.version_label,
            pv.is_active as version_is_active
        FROM products p
        JOIN product_versions pv ON pv.product_id = p.id
        WHERE p.owner_id = $1 AND (pv.is_active = true OR (pv.is_active = false AND NOT EXISTS (SELECT 1 FROM product_versions pv2 WHERE pv2.product_id = p.id AND pv2.is_active = true)))
        ORDER BY p.name ASC
    `, [ownerId]);
};

exports.getVariants = (ownerId) => {
    return db.query(`
        SELECT v.id, v.product_version_id, v.name, v.sku, v.is_active, pv.product_id 
        FROM variants v
        JOIN product_versions pv ON v.product_version_id = pv.id
        WHERE pv.product_id IN (SELECT id FROM products WHERE owner_id = $1)
    `, [ownerId]);
};

exports.insertProduct = (client, ownerId, name) => {
    return client.query(
        `INSERT INTO products (id, owner_id, name) VALUES (gen_random_uuid(), $1, $2) RETURNING id`,
        [ownerId, name]
    );
};

exports.insertVariant = (client, productVersionId, ownerId, name) => {
    return client.query(
        `INSERT INTO variants (id, product_version_id, owner_id, name, is_active) VALUES (gen_random_uuid(), $1, $2, $3, true) RETURNING id`, 
        [productVersionId, ownerId, name]
    );
};

exports.insertProductVersion = (client, productId, vendorPricePaise, vpValue, userId, versionLabel) => {
    return client.query(
        `INSERT INTO product_versions (id, product_id, vendor_price, volume_points, created_by, version_label, is_active) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true) RETURNING id`,
        [productId, vendorPricePaise, vpValue, userId, versionLabel]
    );
};

exports.getActiveVersion = (client, productId) => {
    return client.query(`SELECT id FROM product_versions WHERE product_id = $1 AND is_active = true`, [productId]);
};

exports.deprecateVersion = (client, oldVersionId) => {
    return client.query(`UPDATE product_versions SET is_active = false, effective_to = NOW() WHERE id = $1`, [oldVersionId]);
};

exports.insertNewVersion = (client, productId, vendorPricePaise, userId, versionLabel) => {
    return client.query(
        `INSERT INTO product_versions (id, product_id, vendor_price, created_by, is_active, effective_from, version_label) 
         VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), $4) RETURNING id`,
        [productId, vendorPricePaise, userId, versionLabel]
    );
};

exports.migrateStock = (client, newVersionId, vendorPricePaise, oldVersionId, ownerId) => {
    return client.query(`
        UPDATE stock SET product_version_id = $1, vendor_price_snap = $2 
        WHERE product_version_id = $3 AND owner_id = $4`,
        [newVersionId, vendorPricePaise, oldVersionId, ownerId]
    );
};

exports.getLatestVersion = (productId) => {
    return db.query(`SELECT id, is_active FROM product_versions WHERE product_id = $1 ORDER BY effective_from DESC LIMIT 1`, [productId]);
};

exports.toggleProductVersion = (newStatus, versionId) => {
    return db.query(`UPDATE product_versions SET is_active = $1 WHERE id = $2`, [newStatus, versionId]);
};

exports.addVariantDirect = (productVersionId, ownerId, name) => {
    return db.query(`INSERT INTO variants (id, product_version_id, owner_id, name, is_active) VALUES (gen_random_uuid(), $1, $2, $3, true) RETURNING id`, [productVersionId, ownerId, name]);
};

exports.getVariantStatus = (id) => {
    return db.query(`SELECT is_active FROM variants WHERE id = $1`, [id]);
};

exports.toggleVariantStatus = (newStatus, id) => {
    return db.query(`UPDATE variants SET is_active = $1 WHERE id = $2`, [newStatus, id]);
};

exports.checkVariantDependencies = (id) => {
    // Check both sales and stock
    return db.query(`
        SELECT 1 FROM sale_items WHERE variant_id = $1 
        UNION 
        SELECT 1 FROM stock WHERE variant_id = $1 
        LIMIT 1
    `, [id]);
};

exports.deleteVariantRecord = (id) => {
    return db.query(`DELETE FROM variants WHERE id = $1`, [id]);
};
