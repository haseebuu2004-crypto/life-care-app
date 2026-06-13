const queries = require('./inventory.queries');
const dto = require('./inventory.dto');
const audit = require('../../shared/utils/audit');

exports.getEntities = async (ownerId) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        const result = await queries.getInventoryEntities(ownerId);
        return result.rows.map(row => dto.mapToInventoryEntity(row));
    } catch (error) {
        console.error('[InventoryService] error:', error);
        throw error;
    }
};

exports.searchEntities = async (ownerId, q) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    if (!q || q.trim() === '') return this.getEntities(ownerId);
    
    try {
        const result = await queries.searchInventoryEntities(ownerId, q.trim());
        return result.rows.map(row => dto.mapToInventoryEntity(row));
    } catch (error) {
        console.error('[InventoryService] error:', error);
        throw error;
    }
};

exports.updateEntity = async (variantId, ownerId, userId, data) => {
    if (!ownerId) throw new Error('Unauthorized: missing ownerId');
    try {
        // 1. Fetch current state
        const currentRes = await queries.getVariantById(variantId, ownerId);
        if (currentRes.rows.length === 0) {
            throw { status: 404, message: 'Variant not found' };
        }
        
        const currentVariant = currentRes.rows[0];
        const oldJson = {
            sku: currentVariant.sku,
            is_active: currentVariant.is_active,
            low_stock_threshold: currentVariant.low_stock_threshold,
            alert_enabled: currentVariant.alert_enabled
        };

        // 2. Validate SKU globally if changed
        if (data.sku !== undefined && data.sku !== null && data.sku !== currentVariant.sku) {
            const skuCheck = await queries.checkDuplicateSku(data.sku, variantId);
            if (skuCheck.rows.length > 0) {
                throw { status: 400, message: 'SKU already exists in the system.' };
            }
        }

        // 3. Update variant
        const updateRes = await queries.updateVariant(variantId, data);
        if (updateRes.rowCount === 0) {
            throw { status: 400, message: 'No fields to update' };
        }

        const newJson = {
            sku: updateRes.rows[0].sku,
            is_active: updateRes.rows[0].is_active,
            low_stock_threshold: updateRes.rows[0].low_stock_threshold,
            alert_enabled: updateRes.rows[0].alert_enabled
        };

        // 4. Audit Log
        const actionType = 'INVENTORY_ENTITY_UPDATE';
        await audit.logAction(userId, actionType, 'variants', variantId, oldJson, newJson);

        // 5. Invalidate Dashboard Cache
        const cache = require('../../shared/services/cacheService');
        await cache.invalidateCachePattern(`dashboard_stats:${ownerId}:*`);

        return updateRes.rows[0];
    } catch (error) {
        console.error('[InventoryService] error:', error);
        throw error;
    }
};
