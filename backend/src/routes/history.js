import express from "express";
import History from "../models/History.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";
import {
  getCachedHistoryList,
  cacheHistoryList,
  invalidateHistoryListCache,
  getCachedHistoryCount,
  cacheHistoryCount,
  invalidateHistoryStatsCache,
} from "../utils/historyCacheManager.js";

const router = express.Router();

// GET all histories with pagination (Redis cached)
router.get("/", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user._id.toString();

    // Try to get from Redis cache first
    const cachedList = await getCachedHistoryList(userId, page, limit);
    if (cachedList) {
      console.log(
        `✅ Cache HIT: History list for user ${userId} (page ${page})`,
      );
      return res.json({
        success: true,
        data: cachedList.data,
        pagination: cachedList.pagination,
        cached: true,
      });
    }

    console.log(
      `📝 Cache MISS: Querying database for user ${userId} (page ${page})`,
    );

    // Query database
    const histories = await History.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-graphData.nodes -graphData.edges");

    const total = await History.countDocuments({ user: req.user._id });

    const responseData = {
      data: histories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache the result for 60 seconds
    await cacheHistoryList(userId, page, limit, responseData, 60);

    res.json({
      success: true,
      ...responseData,
      cached: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET stats (Redis cached for 120 seconds)
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Try cache first
    const cachedStats = await getCachedHistoryStats(userId);
    if (cachedStats) {
      console.log(`✅ Cache HIT: History stats for user ${userId}`);
      return res.json({
        success: true,
        ...cachedStats,
        cached: true,
      });
    }

    console.log(`📝 Cache MISS: Computing stats for user ${userId}`);

    const totalGraphs = await History.countDocuments({ user: req.user._id });

    const stats = await History.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalConcepts: { $sum: "$conceptCount" },
          totalRelationships: { $sum: "$relationshipCount" },
          avgConcepts: { $avg: "$conceptCount" },
          avgRelationships: { $avg: "$relationshipCount" },
        },
      },
    ]);

    const recentActivity = await History.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title sourceType conceptCount createdAt");

    const responseData = {
      stats: {
        totalGraphs,
        totalConcepts: stats[0]?.totalConcepts || 0,
        totalRelationships: stats[0]?.totalRelationships || 0,
        avgConcepts: Math.round(stats[0]?.avgConcepts || 0),
        avgRelationships: Math.round(stats[0]?.avgRelationships || 0),
      },
      recentActivity,
    };

    // Cache for 120 seconds
    await cacheHistoryStats(userId, responseData, 120);

    res.json({
      success: true,
      ...responseData,
      cached: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET single history item (Redis cached for 5 minutes)
router.get("/:id", protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const historyId = req.params.id;

    // Try cache first
    const cachedItem = await getCachedHistoryItem(userId, historyId);
    if (cachedItem) {
      console.log(`✅ Cache HIT: History item ${historyId} for user ${userId}`);
      return res.json({
        success: true,
        data: cachedItem,
        cached: true,
      });
    }

    console.log(`📝 Cache MISS: Fetching item ${historyId} from database`);

    const history = await History.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        error: "History not found",
      });
    }

    // Cache for 5 minutes
    await cacheHistoryItem(userId, historyId, history, 300);

    res.json({
      success: true,
      data: history,
      cached: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { title, sourceType, sourcePreview, graphData } = req.body;
    const userId = req.user._id.toString();

    console.log("\n========== Saving History ==========");
    console.log("User ID:", userId);
    console.log("Title:", title);
    console.log("Source Type:", sourceType);
    console.log("Concepts:", graphData.concepts?.length || 0);
    console.log("Relationships:", graphData.relationships?.length || 0);

    const history = await History.create({
      user: req.user._id,
      title,
      sourceType,
      sourcePreview,
      conceptCount: graphData.concepts?.length || 0,
      relationshipCount: graphData.relationships?.length || 0,
      graphData,
    });

    // Invalidate all history caches for this user (list + stats)
    await invalidateHistoryListCache(userId);
    await invalidateHistoryStatsCache(userId);
    console.log(`🔄 Cache invalidated for user: ${userId}`);

    // Create notification for the user
    await Notification.create({
      user: req.user._id,
      type: "success",
      title: "Graph Generated Successfully! ✨",
      message: `Your graph "${title}" with ${graphData.concepts?.length || 0} concepts has been created.`,
      link: `/history`,
      metadata: { historyId: history._id },
    });

    console.log("✅ History saved successfully! ID:", history._id);
    console.log("=====================================\n");

    res.status(201).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.log("\n========== Save History Error ==========");
    console.error("❌ Failed to save history:", error.message);
    console.log("=========================================\n");
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const historyId = req.params.id;

    const history = await History.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        error: "History not found",
      });
    }

    // Invalidate all user history caches
    await invalidateHistoryItemCache(userId, historyId);
    await invalidateHistoryListCache(userId);
    await invalidateHistoryStatsCache(userId);
    console.log(`🔄 Cache invalidated for user: ${userId} (item deleted)`);

    res.json({
      success: true,
      message: "History deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.delete("/", protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    await History.deleteMany({ user: req.user._id });

    // Invalidate all user history caches
    await invalidateHistoryListCache(userId);
    await invalidateHistoryStatsCache(userId);
    console.log(
      `🔄 Cache invalidated for user: ${userId} (all history cleared)`,
    );

    res.json({
      success: true,
      message: "All history cleared",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
