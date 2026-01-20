import {
  incrementCache,
  getCache,
  setCache,
  isRedisConnected,
} from "../config/redis.js";

/**
 * Redis-based rate limiting middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {number} options.max - Maximum requests per window (default: 100)
 * @param {string} options.message - Error message when limit exceeded
 * @param {function} options.keyGenerator - Custom key generator (req) => string
 * @param {boolean} options.skipFailedRequests - Don't count failed requests (default: false)
 */
export const rateLimiter = (options = {}) => {
  const {
    windowMs = 60000,
    max = 100,
    message = "Too many requests, please try again later.",
    keyGenerator = null,
    skipFailedRequests = false,
  } = options;

  const windowSeconds = Math.ceil(windowMs / 1000);

  // In-memory fallback when Redis is not available
  const memoryStore = new Map();

  const getMemoryCount = (key) => {
    const record = memoryStore.get(key);
    if (!record) return 0;
    if (Date.now() > record.resetTime) {
      memoryStore.delete(key);
      return 0;
    }
    return record.count;
  };

  const incrementMemoryCount = (key) => {
    const record = memoryStore.get(key);
    if (!record || Date.now() > record.resetTime) {
      memoryStore.set(key, {
        count: 1,
        resetTime: Date.now() + windowMs,
      });
      return 1;
    }
    record.count++;
    return record.count;
  };

  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime) {
        memoryStore.delete(key);
      }
    }
  }, windowMs);

  return async (req, res, next) => {
    // Generate rate limit key
    let key;
    if (keyGenerator) {
      key = keyGenerator(req);
    } else {
      const identifier =
        req.user?.id || req.ip || req.headers["x-forwarded-for"] || "unknown";
      key = `ratelimit:${identifier}:${req.path}`;
    }

    try {
      let currentCount;
      let remaining;

      if (isRedisConnected()) {
        // Use Redis for distributed rate limiting
        const countKey = `${key}:count`;

        // Get current count
        const cached = await getCache(countKey);
        currentCount = cached ? cached.count : 0;

        if (currentCount >= max) {
          res.set("X-RateLimit-Limit", max);
          res.set("X-RateLimit-Remaining", 0);
          res.set("Retry-After", windowSeconds);

          return res.status(429).json({
            success: false,
            error: "Rate limit exceeded",
            message,
            retryAfter: windowSeconds,
          });
        }

        // Increment count
        currentCount++;
        await setCache(countKey, { count: currentCount }, windowSeconds);
        remaining = Math.max(0, max - currentCount);
      } else {
        // Fallback to in-memory rate limiting
        currentCount = getMemoryCount(key);

        if (currentCount >= max) {
          res.set("X-RateLimit-Limit", max);
          res.set("X-RateLimit-Remaining", 0);
          res.set("Retry-After", windowSeconds);

          return res.status(429).json({
            success: false,
            error: "Rate limit exceeded",
            message,
            retryAfter: windowSeconds,
          });
        }

        currentCount = incrementMemoryCount(key);
        remaining = Math.max(0, max - currentCount);
      }

      // Set rate limit headers
      res.set("X-RateLimit-Limit", max);
      res.set("X-RateLimit-Remaining", remaining);

      // Handle skipFailedRequests
      if (skipFailedRequests) {
        const originalJson = res.json.bind(res);
        res.json = async (data) => {
          // Decrement count for failed requests
          if (res.statusCode >= 400 && isRedisConnected()) {
            const countKey = `${key}:count`;
            const cached = await getCache(countKey);
            if (cached && cached.count > 0) {
              await setCache(
                countKey,
                { count: cached.count - 1 },
                windowSeconds,
              );
            }
          }
          return originalJson(data);
        };
      }

      next();
    } catch (error) {
      console.error("Rate limiter error:", error.message);
      // On error, allow the request through
      next();
    }
  };
};

/**
 * Strict rate limiter for sensitive endpoints (login, register, etc.)
 */
export const strictRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: "Too many attempts. Please try again in 15 minutes.",
  skipFailedRequests: true,
});

/**
 * API rate limiter for general endpoints
 */
export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: "API rate limit exceeded. Please slow down.",
});

/**
 * Upload rate limiter
 */
export const uploadRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message:
    "Upload rate limit exceeded. Please wait before uploading more files.",
});

export default {
  rateLimiter,
  strictRateLimiter,
  apiRateLimiter,
  uploadRateLimiter,
};
