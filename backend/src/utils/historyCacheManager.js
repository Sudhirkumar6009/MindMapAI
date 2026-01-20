import {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  isRedisConnected,
} from "../config/redis.js";

/**
 * History Cache Manager
 * Handles all caching logic for user's mindmap history
 */

const CACHE_KEYS = {
  // List with pagination: history:user_id:list:page:limit
  LIST: (userId, page, limit) => `history:${userId}:list:${page}:${limit}`,
  // Single history item: history:user_id:item:id
  ITEM: (userId, id) => `history:${userId}:item:${id}`,
  // Stats: history:user_id:stats
  STATS: (userId) => `history:${userId}:stats`,
  // Count: history:user_id:count
  COUNT: (userId) => `history:${userId}:count`,
  // All user history pattern for bulk invalidation
  USER_PATTERN: (userId) => `history:${userId}:*`,
};

/**
 * Cache a history list with pagination
 */
export const cacheHistoryList = async (userId, page, limit, data, ttl = 60) => {
  if (!isRedisConnected()) return false;

  const key = CACHE_KEYS.LIST(userId, page, limit);
  return await setCache(key, data, ttl);
};

/**
 * Get cached history list
 */
export const getCachedHistoryList = async (userId, page, limit) => {
  if (!isRedisConnected()) return null;

  const key = CACHE_KEYS.LIST(userId, page, limit);
  return await getCache(key);
};

/**
 * Cache a single history item
 */
export const cacheHistoryItem = async (userId, historyId, data, ttl = 300) => {
  if (!isRedisConnected()) return false;

  const key = CACHE_KEYS.ITEM(userId, historyId);
  return await setCache(key, data, ttl);
};

/**
 * Get cached history item
 */
export const getCachedHistoryItem = async (userId, historyId) => {
  if (!isRedisConnected()) return null;

  const key = CACHE_KEYS.ITEM(userId, historyId);
  return await getCache(key);
};

/**
 * Cache history stats
 */
export const cacheHistoryStats = async (userId, data, ttl = 120) => {
  if (!isRedisConnected()) return false;

  const key = CACHE_KEYS.STATS(userId);
  return await setCache(key, data, ttl);
};

/**
 * Get cached history stats
 */
export const getCachedHistoryStats = async (userId) => {
  if (!isRedisConnected()) return null;

  const key = CACHE_KEYS.STATS(userId);
  return await getCache(key);
};

/**
 * Cache history count
 */
export const cacheHistoryCount = async (userId, count, ttl = 120) => {
  if (!isRedisConnected()) return false;

  const key = CACHE_KEYS.COUNT(userId);
  return await setCache(key, { count }, ttl);
};

/**
 * Get cached history count
 */
export const getCachedHistoryCount = async (userId) => {
  if (!isRedisConnected()) return null;

  const key = CACHE_KEYS.COUNT(userId);
  const data = await getCache(key);
  return data?.count || null;
};

/**
 * Invalidate all history caches for a user
 * Call this after CREATE, UPDATE, or DELETE operations
 */
export const invalidateUserHistoryCache = async (userId) => {
  if (!isRedisConnected()) return false;

  try {
    const pattern = CACHE_KEYS.USER_PATTERN(userId);
    await deleteCachePattern(pattern);
    console.log(`Cache invalidated for user: ${userId}`);
    return true;
  } catch (error) {
    console.error("Invalidate user history cache error:", error.message);
    return false;
  }
};

/**
 * Invalidate specific history item cache
 */
export const invalidateHistoryItemCache = async (userId, historyId) => {
  if (!isRedisConnected()) return false;

  try {
    const key = CACHE_KEYS.ITEM(userId, historyId);
    await deleteCache(key);
    return true;
  } catch (error) {
    console.error("Invalidate history item cache error:", error.message);
    return false;
  }
};

/**
 * Invalidate list caches (all pages for a user)
 */
export const invalidateHistoryListCache = async (userId) => {
  if (!isRedisConnected()) return false;

  try {
    const pattern = `history:${userId}:list:*`;
    await deleteCachePattern(pattern);
    return true;
  } catch (error) {
    console.error("Invalidate history list cache error:", error.message);
    return false;
  }
};

/**
 * Invalidate stats and count caches
 */
export const invalidateHistoryStatsCache = async (userId) => {
  if (!isRedisConnected()) return false;

  try {
    await deleteCache(CACHE_KEYS.STATS(userId));
    await deleteCache(CACHE_KEYS.COUNT(userId));
    return true;
  } catch (error) {
    console.error("Invalidate history stats cache error:", error.message);
    return false;
  }
};

export default {
  CACHE_KEYS,
  cacheHistoryList,
  getCachedHistoryList,
  cacheHistoryItem,
  getCachedHistoryItem,
  cacheHistoryStats,
  getCachedHistoryStats,
  cacheHistoryCount,
  getCachedHistoryCount,
  invalidateUserHistoryCache,
  invalidateHistoryItemCache,
  invalidateHistoryListCache,
  invalidateHistoryStatsCache,
};
