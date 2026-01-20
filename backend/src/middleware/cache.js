import {
  getCache,
  setCache,
  isRedisConnected,
  deleteCache,
  deleteCachePattern,
} from "../config/redis.js";

/**
 * Cache middleware factory
 * @param {Object} options - Cache options
 * @param {number} options.expireSeconds - Cache expiration in seconds (default: 300)
 * @param {function} options.keyGenerator - Custom key generator function (req) => string
 * @param {boolean} options.userSpecific - Whether cache is user-specific (default: true)
 */
export const cacheMiddleware = (options = {}) => {
  const {
    expireSeconds = 300,
    keyGenerator = null,
    userSpecific = true,
  } = options;

  return async (req, res, next) => {
    // Skip caching if Redis is not connected
    if (!isRedisConnected()) {
      return next();
    }

    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Generate cache key
    let cacheKey;
    if (keyGenerator) {
      cacheKey = keyGenerator(req);
    } else {
      const userId = userSpecific && req.user ? req.user.id : "anonymous";
      cacheKey = `cache:${userId}:${req.originalUrl}`;
    }

    try {
      // Try to get cached response
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`Cache MISS: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache the response
      res.json = async (data) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          await setCache(cacheKey, data, expireSeconds);
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error.message);
      next();
    }
  };
};

/**
 * Clear user-specific cache
 */
export const clearUserCache = async (userId) => {
  if (!isRedisConnected()) return false;

  try {
    await deleteCachePattern(`cache:${userId}:*`);
    await deleteCachePattern(`user:${userId}:*`);
    return true;
  } catch (error) {
    console.error("Clear user cache error:", error.message);
    return false;
  }
};

/**
 * Clear specific route cache for a user
 */
export const clearRouteCache = async (userId, route) => {
  if (!isRedisConnected()) return false;

  try {
    const cacheKey = `cache:${userId}:${route}`;
    await deleteCache(cacheKey);
    return true;
  } catch (error) {
    console.error("Clear route cache error:", error.message);
    return false;
  }
};

/**
 * Invalidate cache decorator for mutation endpoints
 * Use this after POST/PUT/DELETE operations to clear related caches
 */
export const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = async (data) => {
      // Invalidate cache after successful mutation
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || "anonymous";

        for (const pattern of patterns) {
          const fullPattern =
            typeof pattern === "function"
              ? pattern(req, userId)
              : `cache:${userId}:${pattern}`;

          await deleteCachePattern(fullPattern);
          console.log(`Cache invalidated: ${fullPattern}`);
        }
      }
      return originalJson(data);
    };

    next();
  };
};

export default {
  cacheMiddleware,
  clearUserCache,
  clearRouteCache,
  invalidateCache,
};
