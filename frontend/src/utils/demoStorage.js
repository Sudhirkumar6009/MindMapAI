/**
 * Secure Demo Usage Storage
 * Uses encoded data with integrity checks to prevent manual tampering
 */

// Storage keys (obfuscated)
const STORAGE_KEY = '_mmai_dx';
const COOKIE_KEY = '_mmai_cx';
const SECRET_SALT = 'MindMapAI_2026_Secure';

/**
 * Simple hash function for integrity check (deterministic, no time component)
 */
function generateHash(usage, timestamp) {
  const str = `${SECRET_SALT}:${usage}:${timestamp}:mmai`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Encode data with integrity signature
 */
function encodeData(usage, timestamp) {
  const payload = {
    u: usage,
    t: timestamp,
    v: 1, // version
  };
  
  // Create deterministic signature based on usage and timestamp
  payload.s = generateHash(usage, timestamp);
  
  // Base64 encode the JSON
  try {
    return btoa(JSON.stringify(payload));
  } catch {
    return null;
  }
}

/**
 * Decode and validate data
 */
function decodeData(encoded) {
  if (!encoded) return null;
  
  try {
    const decoded = JSON.parse(atob(encoded));
    
    // Basic structure validation
    if (typeof decoded.u !== 'number' || typeof decoded.t !== 'number' || typeof decoded.s !== 'string') {
      console.warn('[DemoStorage] Invalid structure');
      return null;
    }
    
    // Validate signature (deterministic check)
    const expectedHash = generateHash(decoded.u, decoded.t);
    if (decoded.s !== expectedHash) {
      console.warn('[DemoStorage] Signature mismatch - possible tampering');
      return null;
    }
    
    // Validate reasonable values
    if (decoded.u < 0 || decoded.u > 100) {
      console.warn('[DemoStorage] Unreasonable usage value');
      return null;
    }
    
    return {
      usage: decoded.u,
      timestamp: decoded.t,
    };
  } catch (err) {
    console.warn('[DemoStorage] Decode error:', err.message);
    return null;
  }
}

/**
 * Set cookie with httpOnly-like protection (can't be fully httpOnly in client-side)
 */
function setCookie(name, value, days = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  // Use SameSite=Strict for additional security
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

/**
 * Get cookie value
 */
function getCookie(name) {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
}

/**
 * Get demo usage with cross-validation between localStorage and cookie
 */
export function getDemoUsage() {
  try {
    const lsData = localStorage.getItem(STORAGE_KEY);
    const cookieData = getCookie(COOKIE_KEY);
    
    const lsDecoded = decodeData(lsData);
    const cookieDecoded = decodeData(cookieData);
    
    console.log('[DemoStorage] getDemoUsage - LS:', lsDecoded?.usage, 'Cookie:', cookieDecoded?.usage);
    
    // If both exist, use the higher value (prevents reset attacks)
    if (lsDecoded && cookieDecoded) {
      const maxUsage = Math.max(lsDecoded.usage, cookieDecoded.usage);
      console.log('[DemoStorage] Using max value:', maxUsage);
      return maxUsage;
    }
    
    // If only one exists, use it but sync both
    if (lsDecoded) {
      // Sync to cookie
      const encoded = encodeData(lsDecoded.usage, lsDecoded.timestamp);
      if (encoded) setCookie(COOKIE_KEY, encoded);
      console.log('[DemoStorage] Using localStorage value:', lsDecoded.usage);
      return lsDecoded.usage;
    }
    
    if (cookieDecoded) {
      // Sync to localStorage
      const encoded = encodeData(cookieDecoded.usage, cookieDecoded.timestamp);
      if (encoded) localStorage.setItem(STORAGE_KEY, encoded);
      console.log('[DemoStorage] Using cookie value:', cookieDecoded.usage);
      return cookieDecoded.usage;
    }
    
    // No valid data found, initialize
    console.log('[DemoStorage] No valid data found, returning 0');
    return 0;
  } catch (err) {
    console.error('[DemoStorage] getDemoUsage error:', err);
    return 0;
  }
}

/**
 * Set demo usage with dual storage
 */
export function setDemoUsage(usage) {
  try {
    const timestamp = Date.now();
    const encoded = encodeData(usage, timestamp);
    
    if (encoded) {
      // Store in both localStorage and cookie
      localStorage.setItem(STORAGE_KEY, encoded);
      setCookie(COOKIE_KEY, encoded);
      console.log('[DemoStorage] setDemoUsage - Stored usage:', usage);
      
      // Also store a backup with different key
      const backupKey = `_mmai_bk_${timestamp.toString().slice(-6)}`;
      sessionStorage.setItem(backupKey, encoded);
    } else {
      console.error('[DemoStorage] setDemoUsage - Failed to encode');
    }
    
    return true;
  } catch (err) {
    console.error('[DemoStorage] setDemoUsage error:', err);
    return false;
  }
}

/**
 * Increment demo usage
 */
export function incrementDemoUsage() {
  const current = getDemoUsage();
  const newUsage = current + 1;
  console.log('[DemoStorage] incrementDemoUsage:', current, '->', newUsage);
  setDemoUsage(newUsage);
  return newUsage;
}

/**
 * Check if demo limit reached
 */
export function isDemoLimitReached(limit = 3) {
  return getDemoUsage() >= limit;
}

/**
 * Clear demo usage (for testing or admin purposes)
 * This should NOT be exposed to users
 */
export function clearDemoUsage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    
    // Clear cookie
    document.cookie = `${COOKIE_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    
    console.log('[DemoStorage] Cleared all demo usage data');
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate and repair storage integrity
 * Call this on app init to ensure consistency
 */
export function validateStorage() {
  try {
    // Check if we have old/corrupted data
    const lsData = localStorage.getItem(STORAGE_KEY);
    const cookieData = getCookie(COOKIE_KEY);
    
    // Try to decode existing data
    const lsDecoded = decodeData(lsData);
    const cookieDecoded = decodeData(cookieData);
    
    // If both fail to decode but data exists, clear and start fresh
    if ((lsData && !lsDecoded) || (cookieData && !cookieDecoded)) {
      console.log('[DemoStorage] Found corrupted data, clearing...');
      clearDemoUsage();
      return { valid: true, usage: 0 };
    }
    
    const usage = getDemoUsage();
    console.log('[DemoStorage] validateStorage - Current usage:', usage);
    
    // Re-save to ensure both storages are in sync
    if (usage > 0) {
      setDemoUsage(usage);
    }
    
    return { valid: true, usage };
  } catch (err) {
    console.error('[DemoStorage] validateStorage error:', err);
    return { valid: false, usage: 0 };
  }
}

export default {
  getDemoUsage,
  setDemoUsage,
  incrementDemoUsage,
  isDemoLimitReached,
  validateStorage,
};
