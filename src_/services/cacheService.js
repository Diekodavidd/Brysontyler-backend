const redis = require("../config_/redis");

const cacheService = {

    async get(key) {
        const data = await redis.get(key);

        if (!data) {
            return null;
        }

        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    },

    async set(key, value, ttl = 300) {
        await redis.set(
            key,
            JSON.stringify(value),
            "EX",
            ttl
        );
    },

    async del(key) {
        await redis.del(key);
    },

    async delByPattern(pattern) {
        const keys = await redis.keys(pattern);

        if (keys.length > 0) {
            await redis.del(...keys);
        }
    },

};

module.exports = cacheService;