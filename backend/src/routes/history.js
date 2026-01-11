import express from 'express';
import History from '../models/History.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const histories = await History.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-graphData.nodes -graphData.edges');

    const total = await History.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: histories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/stats', protect, async (req, res) => {
  try {
    const totalGraphs = await History.countDocuments({ user: req.user._id });
    
    const stats = await History.aggregate([
      { $match: { user: req.user._id } },
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

    const recentActivity = await History.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title sourceType conceptCount createdAt');

    res.json({
      success: true,
      stats: {
        totalGraphs,
        totalConcepts: stats[0]?.totalConcepts || 0,
        totalRelationships: stats[0]?.totalRelationships || 0,
        avgConcepts: Math.round(stats[0]?.avgConcepts || 0),
        avgRelationships: Math.round(stats[0]?.avgRelationships || 0)
      },
      recentActivity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const history = await History.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        error: 'History not found'
      });
    }

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, sourceType, sourcePreview, graphData } = req.body;

    console.log('\n========== Saving History ==========');
    console.log('User ID:', req.user._id);
    console.log('Title:', title);
    console.log('Source Type:', sourceType);
    console.log('Concepts:', graphData.concepts?.length || 0);
    console.log('Relationships:', graphData.relationships?.length || 0);

    const history = await History.create({
      user: req.user._id,
      title,
      sourceType,
      sourcePreview,
      conceptCount: graphData.concepts?.length || 0,
      relationshipCount: graphData.relationships?.length || 0,
      graphData
    });

    // Create notification for the user
    await Notification.create({
      user: req.user._id,
      type: 'success',
      title: 'Graph Generated Successfully! ✨',
      message: `Your graph "${title}" with ${graphData.concepts?.length || 0} concepts has been created.`,
      link: `/history`,
      metadata: { historyId: history._id }
    });

    console.log('✅ History saved successfully! ID:', history._id);
    console.log('=====================================\n');

    res.status(201).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.log('\n========== Save History Error ==========');
    console.error('❌ Failed to save history:', error.message);
    console.log('=========================================\n');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const history = await History.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        error: 'History not found'
      });
    }

    res.json({
      success: true,
      message: 'History deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.delete('/', protect, async (req, res) => {
  try {
    await History.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      message: 'All history cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
