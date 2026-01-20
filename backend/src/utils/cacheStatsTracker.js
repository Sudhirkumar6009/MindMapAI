/**
 * Cache Stats Tracker
 * Monitors and reports Redis cache performance metrics
 */

class CacheStatsTracker {
  constructor() {
    this.stats = {
      hits: 0,
      misses: 0,
      invalidations: 0,
    };
  }

  recordHit(key) {
    this.stats.hits++;
    console.log(`✅ Cache HIT [${this.getHitRate()}% rate] - ${key}`);
  }

  recordMiss(key) {
    this.stats.misses++;
    console.log(`📝 Cache MISS [${this.getHitRate()}% rate] - ${key}`);
  }

  recordInvalidation(pattern) {
    this.stats.invalidations++;
    console.log(`🔄 Cache INVALIDATED - ${pattern}`);
  }

  getHitRate() {
    const total = this.stats.hits + this.stats.misses;
    if (total === 0) return 0;
    return Math.round((this.stats.hits / total) * 100);
  }

  getStats() {
    return {
      ...this.stats,
      hitRate: `${this.getHitRate()}%`,
      totalRequests: this.stats.hits + this.stats.misses,
    };
  }

  reset() {
    this.stats = {
      hits: 0,
      misses: 0,
      invalidations: 0,
    };
  }

  printReport() {
    const stats = this.getStats();
    console.log("\n═══════════════════════════════════════════");
    console.log("          📊 CACHE PERFORMANCE REPORT        ");
    console.log("═══════════════════════════════════════════");
    console.log(`Total Requests:    ${stats.totalRequests}`);
    console.log(`Cache Hits:        ${stats.hits} ✅`);
    console.log(`Cache Misses:      ${stats.misses} 📝`);
    console.log(`Invalidations:     ${stats.invalidations} 🔄`);
    console.log(`Hit Rate:          ${stats.hitRate}`);
    console.log("═══════════════════════════════════════════\n");
  }
}

export const cacheTracker = new CacheStatsTracker();

export default cacheTracker;
