import express from 'express';
import History from '../models/History.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/dashboard
 * Get comprehensive dashboard data for the logged-in user
 */
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Update last active
    await User.findByIdAndUpdate(userId, {
      'stats.lastActiveAt': new Date()
    });

    // Get total graphs count
    const totalGraphs = await History.countDocuments({ user: userId });

    // Get aggregated stats
    const aggregateStats = await History.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalConcepts: { $sum: '$conceptCount' },
          totalRelationships: { $sum: '$relationshipCount' },
          avgConcepts: { $avg: '$conceptCount' },
          avgRelationships: { $avg: '$relationshipCount' }
        }
      }
    ]);

    // Get graphs by source type
    const graphsByType = await History.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$sourceType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activity (last 10 graphs)
    const recentGraphs = await History.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title sourceType conceptCount relationshipCount createdAt');

    // Get graphs created per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyActivity = await History.aggregate([
      { 
        $match: { 
          user: userId,
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          concepts: { $sum: '$conceptCount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get user info with plan details
    const user = await User.findById(userId).select('name email plan planExpiresAt stats settings createdAt');

    // Format response
    const typeStats = {};
    graphsByType.forEach(item => {
      typeStats[item._id] = item.count;
    });

    res.json({
      success: true,
      dashboard: {
        user: {
          name: user.name,
          email: user.email,
          plan: user.plan,
          memberSince: user.createdAt,
          lastActive: user.stats?.lastActiveAt
        },
        stats: {
          totalGraphs,
          totalConcepts: aggregateStats[0]?.totalConcepts || 0,
          totalRelationships: aggregateStats[0]?.totalRelationships || 0,
          avgConceptsPerGraph: Math.round(aggregateStats[0]?.avgConcepts || 0),
          avgRelationshipsPerGraph: Math.round(aggregateStats[0]?.avgRelationships || 0),
          graphsByType: typeStats
        },
        recentGraphs,
        dailyActivity,
        quickStats: {
          thisWeek: await getThisWeekCount(userId),
          thisMonth: await getThisMonthCount(userId)
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/quick-stats
 * Get quick stats for header/sidebar display
 */
router.get('/quick-stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalGraphs = await History.countDocuments({ user: userId });
    const user = await User.findById(userId).select('plan stats');

    res.json({
      success: true,
      stats: {
        totalGraphs,
        plan: user.plan,
        totalConceptsGenerated: user.stats?.totalConceptsGenerated || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions
async function getThisWeekCount(userId) {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return await History.countDocuments({
    user: userId,
    createdAt: { $gte: startOfWeek }
  });
}

async function getThisMonthCount(userId) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return await History.countDocuments({
    user: userId,
    createdAt: { $gte: startOfMonth }
  });
}

export default router;
