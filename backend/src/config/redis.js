import { createClient } from "redis";

let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis connection
 */
export const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("Redis: Max reconnection attempts reached");
            return new Error("Max reconnection attempts reached");
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err.message);
      isConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("Redis: Connecting...");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis connected and ready");
      isConnected = true;
    });

    redisClient.on("end", () => {
      console.log("Redis: Connection closed");
      isConnected = false;
    });

    redisClient.on("reconnecting", () => {
      console.log("Redis: Reconnecting...");
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("❌ Redis connection failed:", error.message);
    console.log("Server will continue without Redis caching.");
    isConnected = false;
    return null;
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = () => redisClient;

/**
 * Check if Redis is connected
 */
export const isRedisConnected = () => isConnected && redisClient?.isOpen;

/**
 * Ping Redis and measure latency
 */
export const pingRedis = async () => {
  if (!isRedisConnected()) {
    return { ok: false, connected: false };
  }

  try {
    const started = Date.now();
    const reply = await redisClient.ping();
    const latencyMs = Date.now() - started;
    return { ok: true, connected: true, reply, latencyMs };
  } catch (error) {
    console.error("Redis PING error:", error.message);
    return { ok: false, connected: false, error: error.message };
  }
};

/**
 * Set a value with optional expiration (in seconds)
 */
export const setCache = async (key, value, expireSeconds = 3600) => {
  if (!isRedisConnected()) return false;

  try {
    const serialized = JSON.stringify(value);
    if (expireSeconds) {
      await redisClient.setEx(key, expireSeconds, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error("Redis SET error:", error.message);
    return false;
  }
};

/**
 * Get a value from cache
 */
export const getCache = async (key) => {
  if (!isRedisConnected()) return null;

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis GET error:", error.message);
    return null;
  }
};

/**
 * Delete a key from cache
 */
export const deleteCache = async (key) => {
  if (!isRedisConnected()) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Redis DEL error:", error.message);
    return false;
  }
};

/**
 * Delete multiple keys matching a pattern
 */
export const deleteCachePattern = async (pattern) => {
  if (!isRedisConnected()) return false;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error("Redis DEL pattern error:", error.message);
    return false;
  }
};

/**
 * Set hash field
 */
export const setHashCache = async (key, field, value, expireSeconds = 3600) => {
  if (!isRedisConnected()) return false;

  try {
    await redisClient.hSet(key, field, JSON.stringify(value));
    if (expireSeconds) {
      await redisClient.expire(key, expireSeconds);
    }
    return true;
  } catch (error) {
    console.error("Redis HSET error:", error.message);
    return false;
  }
};

/**
 * Get hash field
 */
export const getHashCache = async (key, field) => {
  if (!isRedisConnected()) return null;

  try {
    const data = await redisClient.hGet(key, field);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis HGET error:", error.message);
    return null;
  }
};

/**
 * Get all hash fields
 */
export const getHashAllCache = async (key) => {
  if (!isRedisConnected()) return null;

  try {
    const data = await redisClient.hGetAll(key);
    if (!data || Object.keys(data).length === 0) return null;

    const parsed = {};
    for (const [field, value] of Object.entries(data)) {
      parsed[field] = JSON.parse(value);
    }
    return parsed;
  } catch (error) {
    console.error("Redis HGETALL error:", error.message);
    return null;
  }
};

/**
 * Increment a counter
 */
export const incrementCache = async (key, expireSeconds = null) => {
  if (!isRedisConnected()) return null;

  try {
    const value = await redisClient.incr(key);
    if (expireSeconds) {
      await redisClient.expire(key, expireSeconds);
    }
    return value;
  } catch (error) {
    console.error("Redis INCR error:", error.message);
    return null;
  }
};

/**
 * Check if key exists
 */
export const existsCache = async (key) => {
  if (!isRedisConnected()) return false;

  try {
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    console.error("Redis EXISTS error:", error.message);
    return false;
  }
};

/**
 * Set key expiration
 */
export const expireCache = async (key, seconds) => {
  if (!isRedisConnected()) return false;

  try {
    await redisClient.expire(key, seconds);
    return true;
  } catch (error) {
    console.error("Redis EXPIRE error:", error.message);
    return false;
  }
};

/**
 * Get TTL of a key
 */
export const getTTL = async (key) => {
  if (!isRedisConnected()) return -1;

  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.error("Redis TTL error:", error.message);
    return -1;
  }
};

/**
 * Flush all cache (use with caution!)
 */
export const flushCache = async () => {
  if (!isRedisConnected()) return false;

  try {
    await redisClient.flushDb();
    return true;
  } catch (error) {
    console.error("Redis FLUSH error:", error.message);
    return false;
  }
};

/**
 * Gracefully close Redis connection
 */
export const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log("Redis connection closed gracefully");
    } catch (error) {
      console.error("Redis close error:", error.message);
      redisClient.disconnect();
    }
  }
};

export default {
  connectRedis,
  getRedisClient,
  isRedisConnected,
  pingRedis,
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  setHashCache,
  getHashCache,
  getHashAllCache,
  incrementCache,
  existsCache,
  expireCache,
  getTTL,
  flushCache,
  closeRedis,
};
