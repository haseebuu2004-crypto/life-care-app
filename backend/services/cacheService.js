const { Redis } = require('@upstash/redis');

let redisClient = null;
const memoryCache = new Map();

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log("Upstash Redis initialized");
} else {
    console.log("No Upstash credentials found. Falling back to in-memory cache.");
}

exports.getCache = async (key) => {
    if (redisClient) {
        try {
            return await redisClient.get(key);
        } catch (e) {
            console.error("Redis Get Error:", e);
            return null;
        }
    } else {
        const item = memoryCache.get(key);
        if (!item) return null;
        if (item.expiry < Date.now()) {
            memoryCache.delete(key);
            return null;
        }
        return item.value;
    }
};

exports.setCache = async (key, value, ttlSeconds = 300) => {
    if (redisClient) {
        try {
            await redisClient.set(key, value, { ex: ttlSeconds });
        } catch (e) {
            console.error("Redis Set Error:", e);
        }
    } else {
        memoryCache.set(key, { value, expiry: Date.now() + (ttlSeconds * 1000) });
    }
};

exports.invalidateCachePattern = async (pattern) => {
    if (redisClient) {
        try {
            // Note: Upstash REST API doesn't support keys() well for large datasets, 
            // but for small apps we can use scan or just delete specific keys
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
        } catch (e) {
            console.error("Redis Invalidate Error:", e);
        }
    } else {
        // Memory fallback wildcard matching
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        for (const key of memoryCache.keys()) {
            if (regex.test(key)) {
                memoryCache.delete(key);
            }
        }
    }
};
