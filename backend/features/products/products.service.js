const queries = require('./products.queries');
const audit = require('../../shared/utils/audit');
const db = require('../../shared/db/connection');

exports.getProducts = async (ownerId) => {
    // 1. Fetch all products
    const result = await queries.getProducts(ownerId);
    
    // 2. Map to ensure we only get latest active/inactive version
    const productsMap = new Map();
    result.rows.forEach(r => {
        if (!productsMap.has(r.product_id) || r.version_is_active) {
            productsMap.set(r.product_id, r);
        }
    });

    // 3. Fetch flavours
    const flavoursRes = await queries.getFlavours(ownerId);
    
    // 4. Group flavours by product
    const flavourMap = {};
    flavoursRes.rows.forEach(f => {
        if (!flavourMap[f.product_id]) flavourMap[f.product_id] = [];
        flavourMap[f.product_id].push({ id: f.id, name: f.name, is_active: f.is_active });
    });
    
    // 5. Format to exact legacy response structure
    return Array.from(productsMap.values()).map(row => ({
        id: row.product_id,
        version_id: row.version_id,
        name: row.product_name,
        vendor_price: row.vendor_price / 100,
        vp: row.volume_points,
        is_active: row.version_is_active,
        flavours: flavourMap[row.product_id] || []
    }));
};

exports.addProduct = async (ownerId, userId, data) => {
    let { name, vendor_price, vp, flavor, volume_points } = data;
    const finalVp = vendor_price !== undefined ? vendor_price : vp;
    const vendorPricePaise = Math.round(Number(finalVp) * 100);

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Create product
        const prodRes = await queries.insertProduct(client, ownerId, name.trim());
        const productId = prodRes.rows[0].id;

        // If flavor provided, add it
        if (flavor && flavor.trim() !== '') {
            await queries.insertFlavour(client, productId, ownerId, flavor.trim());
        }

        // Create initial version
        const vpValue = volume_points ? parseFloat(volume_points) : 0;
        const pvRes = await queries.insertProductVersion(client, productId, vendorPricePaise, vpValue, userId);
        const versionId = pvRes.rows[0].id;

        await client.query('COMMIT');
        client.release();
        
        await audit.logAction(userId, 'PRODUCT_CREATE', 'products', productId);
        return productId;
    } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        throw error; // Re-throw to be caught by controller exactly like legacy
    }
};

exports.updateProductPrice = async (productId, ownerId, userId, data) => {
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
        const newVersionRes = await queries.insertNewVersion(client, productId, vendorPricePaise, userId);
        const newVersionId = newVersionRes.rows[0].id;

        // 3. Migrate stock pointing to old version to new version
        if (oldVersionId) {
            await queries.migrateStock(client, newVersionId, vendorPricePaise, oldVersionId, ownerId);
        }

        await client.query('COMMIT');
        client.release();
        
        await audit.logAction(userId, 'PRODUCT_PRICE_UPDATE', 'products', productId);
    } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        throw error;
    }
};

exports.toggleProductStatus = async (productId) => {
    const currRes = await queries.getLatestVersion(productId);
    if (currRes.rows.length === 0) {
        throw { status: 404, message: "No version found" };
    }
    
    const versionId = currRes.rows[0].id;
    const newStatus = !currRes.rows[0].is_active;
    
    await queries.toggleProductVersion(newStatus, versionId);
    return newStatus;
};

exports.addFlavour = async (ownerId, data) => {
    const { product_id, name } = data;
    await queries.addFlavourDirect(product_id, ownerId, name);
};

exports.toggleFlavour = async (flavourId) => {
    const curr = await queries.getFlavourStatus(flavourId);
    if (curr.rows.length === 0) {
        throw { status: 404, message: "Not found" };
    }
    await queries.toggleFlavourStatus(!curr.rows[0].is_active, flavourId);
};

exports.deleteFlavour = async (flavourId) => {
    const check = await queries.checkFlavourDependencies(flavourId);
    if (check.rows.length > 0) {
        throw { status: 400, message: "Cannot delete flavour because it has existing sales. Disable it instead." };
    }
    await queries.deleteFlavourRecord(flavourId);
};
