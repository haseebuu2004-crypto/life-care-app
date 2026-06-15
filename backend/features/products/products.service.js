const queries = require('./products.queries');
const audit = require('../../shared/utils/audit');
const db = require('../../shared/db/connection');

exports.getProducts = async (ownerId) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        // 1. Fetch all products
        const result = await queries.getProducts(ownerId);
        if (!result || !result.rows) return [];
        
        // 2. Map to ensure we only get latest active/inactive version
        const productsMap = new Map();
        result.rows.forEach(r => {
            if (!productsMap.has(r.product_id) || r.version_is_active) {
                productsMap.set(r.product_id, r);
            }
        });

        // 3. Fetch variants
        const variantsRes = await queries.getVariants(ownerId);
        
        // 4. Group variants by product and filter to only include variants for the mapped versions
        const variantMap = {};
        const activeVersionIds = new Set(Array.from(productsMap.values()).map(r => r.version_id));
        
        if (variantsRes && variantsRes.rows) {
            variantsRes.rows.forEach(f => {
                if (activeVersionIds.has(f.product_version_id)) {
                    if (!variantMap[f.product_id]) variantMap[f.product_id] = [];
                    variantMap[f.product_id].push({ id: f.id, name: f.name, sku: f.sku, is_active: f.is_active });
                }
            });
        }
        
        // 5. Format to exact legacy response structure
        return Array.from(productsMap.values()).map(row => ({
            id: row.product_id,
            version_id: row.version_id,
            name: row.product_name,
            vendor_price: row.vendor_price / 100,
            vp: row.volume_points,
            version_label: row.version_label,
            is_active: row.version_is_active,
            flavours: variantMap[row.product_id] || []
        }));
    } catch (error) {
        console.error('[ProductsService] error:', error);
        throw error;
    }
};

exports.addProduct = async (ownerId, userId, data) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    let { name, vendor_price, vp, flavor, volume_points } = data;
    const finalVp = vendor_price !== undefined ? vendor_price : vp;
    const vendorPricePaise = Math.round(Number(finalVp) * 100);

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Create product
        const prodRes = await queries.insertProduct(client, ownerId, name.trim());
        const productId = prodRes.rows[0].id;

        // Create initial version
        const vpValue = volume_points ? parseFloat(volume_points) : 0;
        const vLabel = data.version_label && data.version_label.trim() !== '' ? data.version_label.trim() : '1';
        const pvRes = await queries.insertProductVersion(client, productId, vendorPricePaise, vpValue, userId, vLabel);
        const versionId = pvRes.rows[0].id;

        // Add variants. Frontend might send 'flavor' as a comma-separated string
        if (flavor && flavor.trim() !== '') {
            const flavorsList = flavor.split(',').map(f => f.trim()).filter(f => f !== '');
            const uniqueFlavorsMap = new Map();

            for (const f of flavorsList) {
                const normalized = f.toLowerCase();
                if (uniqueFlavorsMap.has(normalized)) {
                    throw { status: 400, message: `Duplicate flavour detected: ${f}. Please remove duplicates.` };
                }
                uniqueFlavorsMap.set(normalized, f);
            }

            for (const cleanFlavour of uniqueFlavorsMap.values()) {
                await queries.insertVariant(client, versionId, ownerId, cleanFlavour);
            }
        } else {
            // Always insert a default variant to attach stock to
            await queries.insertVariant(client, versionId, ownerId, 'Standard');
        }

        // Generate SKUs for the newly inserted variants
        await client.query(`
            UPDATE variants v
            SET sku = UPPER(SUBSTRING(p.name FROM 1 FOR 3)) || '-' || UPPER(SUBSTRING(v.name FROM 1 FOR 4)) || '-' || UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 4))
            FROM product_versions pv
            JOIN products p ON p.id = pv.product_id
            WHERE v.product_version_id = pv.id 
              AND pv.id = $1 
              AND (v.sku IS NULL OR v.sku = '')
        `, [versionId]);

        await client.query('COMMIT');
        
        await audit.logAction(userId, 'PRODUCT_CREATE', 'products', productId);
        const cache = require('../../shared/services/cacheService');
        await cache.invalidateCachePattern(`inventory_entities:${ownerId}`);
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
        
        return productId;
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('[ProductsService] error:', error);
        throw error;
    } finally {
        if (client) client.release();
    }
};

exports.updateProductPrice = async (productId, ownerId, userId, data) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    const { vendor_price } = data;
    const vendorPricePaise = Math.round(Number(vendor_price) * 100);

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get current active version
        const currVersionRes = await queries.getActiveVersion(client, productId);
        const oldVersionId = currVersionRes.rows.length > 0 ? currVersionRes.rows[0].id : null;

        if (oldVersionId) {
            // Deprecate old version
            await queries.deprecateVersion(client, oldVersionId);
        }

        // 2. Insert new version
        const vLabel = data.version_label && data.version_label.trim() !== '' ? data.version_label.trim() : `v${Date.now()}`;
        const newVersionRes = await queries.insertNewVersion(client, productId, vendorPricePaise, userId, vLabel);
        const newVersionId = newVersionRes.rows[0].id;

        // 3. Duplicate active variants and migrate stock
        if (oldVersionId) {
            const oldVariantsRes = await client.query(`SELECT id, name FROM variants WHERE product_version_id = $1 AND is_active = true`, [oldVersionId]);
            if (oldVariantsRes.rows.length > 0) {
                for (const row of oldVariantsRes.rows) {
                    const nv = await queries.insertVariant(client, newVersionId, ownerId, row.name);
                    const newVariantId = nv.rows[0].id;
                    
                    // Migrate stock for this specific variant
                    await client.query(`
                        UPDATE stock SET product_version_id = $1, variant_id = $2, vendor_price_snap = $3 
                        WHERE product_version_id = $4 AND variant_id = $5 AND owner_id = $6
                    `, [newVersionId, newVariantId, vendorPricePaise, oldVersionId, row.id, ownerId]);
                }
            } else {
                await queries.insertVariant(client, newVersionId, ownerId, 'Standard');
            }
        } else {
            await queries.insertVariant(client, newVersionId, ownerId, 'Standard');
        }

        await client.query('COMMIT');
        
        await audit.logAction(userId, 'PRODUCT_PRICE_UPDATE', 'products', productId);
        const cache = require('../../shared/services/cacheService');
        await cache.invalidateCachePattern(`inventory_entities:${ownerId}`);
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('[ProductsService] error:', error);
        throw error;
    } finally {
        if (client) client.release();
    }
};

exports.toggleProductStatus = async (productId) => {
    try {
        const currRes = await queries.getLatestVersion(productId);
        if (!currRes || !currRes.rows || currRes.rows.length === 0) {
            throw { status: 404, message: "No version found" };
        }
        
        const versionId = currRes.rows[0].id;
        const newStatus = !currRes.rows[0].is_active;
        
        await queries.toggleProductVersion(newStatus, versionId);
        return newStatus;
    } catch (error) {
        console.error('[ProductsService] error:', error);
        throw error;
    }
};

exports.addVariant = async (ownerId, data) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        const { product_id, product_version_id, name } = data;
        let versionId = product_version_id;
        if (!versionId) {
            const verRes = await queries.getLatestVersion(product_id);
            if (!verRes || !verRes.rows || verRes.rows.length === 0) throw new Error("Product version not found");
            versionId = verRes.rows[0].id;
        }
        await queries.addVariantDirect(versionId, ownerId, name);
        const cache = require('../../shared/services/cacheService');
        await cache.invalidateCachePattern(`inventory_entities:${ownerId}`);
    } catch (error) {
        console.error('[ProductsService] error:', error);
        throw error;
    }
};

exports.toggleVariant = async (variantId) => {
    try {
        const curr = await queries.getVariantStatus(variantId);
        if (!curr || !curr.rows || curr.rows.length === 0) {
            throw { status: 404, message: "Not found" };
        }
        await queries.toggleVariantStatus(!curr.rows[0].is_active, variantId);
    } catch (error) {
        console.error('[ProductsService] error:', error);
        throw error;
    }
};

exports.deleteVariant = async (variantId) => {
    try {
        const check = await queries.checkVariantDependencies(variantId);
        if (check && check.rows && check.rows.length > 0) {
            throw { status: 400, message: "Cannot delete variant because it has existing stock or sales. Disable it instead." };
        }
        await queries.deleteVariantRecord(variantId);
    } catch (error) {
        console.error('[ProductsService] error:', error);
        throw error;
    }
};
