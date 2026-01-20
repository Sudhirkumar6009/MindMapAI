import {
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  setHashCache,
  getHashCache,
  getHashAllCache,
  isRedisConnected,
} from "../config/redis.js";
import crypto from "crypto";

/**
 * Session management using Redis
 * Provides token-based session storage and user session tracking
 */

const SESSION_PREFIX = "session:";
const USER_SESSIONS_PREFIX = "user_sessions:";
const DEFAULT_SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Generate a unique session ID
 */
export const generateSessionId = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Create a new session for a user
 * @param {string} userId - User ID
 * @param {object} sessionData - Session data (token, device info, etc.)
 * @param {number} ttl - Session TTL in seconds
 */
export const createSession = async (
  userId,
  sessionData,
  ttl = DEFAULT_SESSION_TTL,
) => {
  if (!isRedisConnected()) return null;

  const sessionId = generateSessionId();
  const sessionKey = `${SESSION_PREFIX}${sessionId}`;

  const session = {
    id: sessionId,
    userId,
    createdAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
    ...sessionData,
  };

  try {
    // Store the session
    await setCache(sessionKey, session, ttl);

    // Track session under user
    await setHashCache(
      `${USER_SESSIONS_PREFIX}${userId}`,
      sessionId,
      {
        createdAt: session.createdAt,
        device: sessionData.device || "unknown",
        ip: sessionData.ip || "unknown",
      },
      ttl,
    );

    return session;
  } catch (error) {
    console.error("Create session error:", error.message);
    return null;
  }
};

/**
 * Get a session by ID
 * @param {string} sessionId - Session ID
 */
export const getSession = async (sessionId) => {
  if (!isRedisConnected()) return null;

  try {
    const sessionKey = `${SESSION_PREFIX}${sessionId}`;
    const session = await getCache(sessionKey);

    if (session) {
      // Update last accessed time
      session.lastAccessedAt = new Date().toISOString();
      await setCache(sessionKey, session);
    }

    return session;
  } catch (error) {
    console.error("Get session error:", error.message);
    return null;
  }
};

/**
 * Delete a session
 * @param {string} sessionId - Session ID
 * @param {string} userId - User ID (optional, for cleanup)
 */
export const deleteSession = async (sessionId, userId = null) => {
  if (!isRedisConnected()) return false;

  try {
    const sessionKey = `${SESSION_PREFIX}${sessionId}`;

    // Get session to find userId if not provided
    if (!userId) {
      const session = await getCache(sessionKey);
      userId = session?.userId;
    }

    // Delete session
    await deleteCache(sessionKey);

    // Remove from user's session list
    if (userId) {
      const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;
      const sessions = await getHashAllCache(userSessionsKey);
      if (sessions && sessions[sessionId]) {
        delete sessions[sessionId];
        // Re-save without the deleted session
        for (const [sid, data] of Object.entries(sessions)) {
          await setHashCache(userSessionsKey, sid, data);
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Delete session error:", error.message);
    return false;
  }
};

/**
 * Get all sessions for a user
 * @param {string} userId - User ID
 */
export const getUserSessions = async (userId) => {
  if (!isRedisConnected()) return [];

  try {
    const sessions = await getHashAllCache(`${USER_SESSIONS_PREFIX}${userId}`);
    if (!sessions) return [];

    return Object.entries(sessions).map(([sessionId, data]) => ({
      sessionId,
      ...data,
    }));
  } catch (error) {
    console.error("Get user sessions error:", error.message);
    return [];
  }
};

/**
 * Delete all sessions for a user (logout from all devices)
 * @param {string} userId - User ID
 */
export const deleteAllUserSessions = async (userId) => {
  if (!isRedisConnected()) return false;

  try {
    // Get all user sessions
    const sessions = await getUserSessions(userId);

    // Delete each session
    for (const session of sessions) {
      await deleteCache(`${SESSION_PREFIX}${session.sessionId}`);
    }

    // Delete user sessions index
    await deleteCache(`${USER_SESSIONS_PREFIX}${userId}`);

    return true;
  } catch (error) {
    console.error("Delete all user sessions error:", error.message);
    return false;
  }
};

/**
 * Validate and refresh a session
 * Returns the session if valid, null otherwise
 * @param {string} sessionId - Session ID
 */
export const validateSession = async (sessionId) => {
  if (!isRedisConnected()) return null;

  try {
    const session = await getSession(sessionId);

    if (!session) {
      return null;
    }

    // Check if session has expired (shouldn't happen with Redis TTL, but just in case)
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt && expiresAt < new Date()) {
      await deleteSession(sessionId, session.userId);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Validate session error:", error.message);
    return null;
  }
};

/**
 * Store temporary data (e.g., for password reset tokens)
 * @param {string} key - Key identifier
 * @param {any} data - Data to store
 * @param {number} ttl - Time to live in seconds
 */
export const storeTemporaryData = async (key, data, ttl = 3600) => {
  if (!isRedisConnected()) return false;

  try {
    await setCache(`temp:${key}`, data, ttl);
    return true;
  } catch (error) {
    console.error("Store temporary data error:", error.message);
    return false;
  }
};

/**
 * Get and delete temporary data (one-time use)
 * @param {string} key - Key identifier
 */
export const getAndDeleteTemporaryData = async (key) => {
  if (!isRedisConnected()) return null;

  try {
    const data = await getCache(`temp:${key}`);
    if (data) {
      await deleteCache(`temp:${key}`);
    }
    return data;
  } catch (error) {
    console.error("Get temporary data error:", error.message);
    return null;
  }
};

export default {
  generateSessionId,
  createSession,
  getSession,
  deleteSession,
  getUserSessions,
  deleteAllUserSessions,
  validateSession,
  storeTemporaryData,
  getAndDeleteTemporaryData,
};
