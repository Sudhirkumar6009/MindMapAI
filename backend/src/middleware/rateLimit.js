/**
 * In-memory rate limiting middleware
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

  // In-memory store for rate limiting
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

    // Check current count
    const currentCount = getMemoryCount(key);

    if (currentCount >= max) {
      return res.status(429).json({
        success: false,
        error: message,
      });
    }

    // Increment count
    const newCount = incrementMemoryCount(key);

    // Add rate limit headers
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - newCount));

    // If skipFailedRequests, decrement on error response
    if (skipFailedRequests) {
      res.on("finish", () => {
        if (res.statusCode >= 400) {
          const record = memoryStore.get(key);
          if (record && record.count > 0) {
            record.count--;
          }
        }
      });
    }

    next();
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
