require('dotenv').config({ path: './.env' });
const cache = require('./shared/services/cacheService');

(async () => {
    try {
        await cache.setCache('inventory_entities:test_owner', { stock: 100 }, 600);
        let val = await cache.getCache('inventory_entities:test_owner');
        console.log("Before invalidation:", val);
        
        await cache.invalidateCachePattern('inventory_entities:test_owner');
        
        let valAfter = await cache.getCache('inventory_entities:test_owner');
        console.log("After exact invalidation:", valAfter);
        
        await cache.invalidateCachePattern('inventory_entities:test_owner*');
        
        let valAfterStar = await cache.getCache('inventory_entities:test_owner');
        console.log("After star invalidation:", valAfterStar);
    } catch(e) { console.error(e); }
    process.exit(0);
})();
