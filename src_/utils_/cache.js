const redis = require("../config_/redis");

const getCache = async (key) => {
  try {
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Redis GET error:", error.message);
    return null;
  }
};

const setCache = async (key, data, ttl = 300) => {
  try {
    await redis.set(
      key,
      JSON.stringify(data),
      "EX",
      ttl
    );
  } catch (error) {
    console.error("Redis SET error:", error.message);
  }
};

const deleteCache = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis DELETE error:", error.message);
  }
};

const deleteCacheByPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(
      "Redis PATTERN DELETE error:",
      error.message
    );
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
};