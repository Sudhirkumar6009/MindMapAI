import express from 'express';
import mongoose from 'mongoose';
import { protect, optionalAuth } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Custom Graph Schema (inline for simplicity, could be separate model)
const customGraphSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous graphs for demo users
  },
  sessionId: {
    type: String, // For demo users without accounts
    required: false
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  nodes: [{
    id: { type: String, required: true },
    label: { type: String, required: true },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    },
    style: {
      type: { type: String, default: 'standard' },
      color: String,
      size: String
    },
    data: mongoose.Schema.Types.Mixed
  }],
  edges: [{
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    label: String,
    style: {
      type: { type: String, default: 'default' },
      animated: { type: Boolean, default: false },
      color: String
    }
  }],
  settings: {
    layout: { type: String, default: 'dagre' },
    nodeStyle: { type: String, default: 'standard' },
    palette: { type: String, default: 'academic' },
    showLabels: { type: Boolean, default: true }
  },
  metadata: {
    nodeCount: { type: Number, default: 0 },
    edgeCount: { type: Number, default: 0 },
    lastEditedAt: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Create index for efficient querying
customGraphSchema.index({ user: 1, createdAt: -1 });
customGraphSchema.index({ sessionId: 1 });
customGraphSchema.index({ isPublic: 1 });

const CustomGraph = mongoose.model('CustomGraph', customGraphSchema);

/**
 * POST /api/graphs
 * Create a new custom graph
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { title, description, nodes, edges, settings, isPublic, sessionId } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const graphData = {
      title,
      description: description || '',
      nodes: nodes || [],
      edges: edges || [],
      settings: settings || {},
      isPublic: isPublic || false,
      metadata: {
        nodeCount: nodes?.length || 0,
        edgeCount: edges?.length || 0,
        lastEditedAt: new Date()
      }
    };

    // If user is authenticated, associate with user
    if (req.user) {
      graphData.user = req.user._id;
    } else if (sessionId) {
      // For demo users, use session ID
      graphData.sessionId = sessionId;
    }

    const graph = await CustomGraph.create(graphData);

    // Create notification for authenticated users
    if (req.user) {
      await Notification.createGraphNotification(req.user._id, graph.title, graph._id);
    }

    console.log(`📊 Custom graph created: ${graph._id} (${nodes?.length || 0} nodes)`);

    res.status(201).json({
      success: true,
      graph: {
        id: graph._id,
        title: graph.title,
        nodeCount: graph.metadata.nodeCount,
        edgeCount: graph.metadata.edgeCount,
        createdAt: graph.createdAt
      }
    });
  } catch (error) {
    console.error('Create graph error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/graphs
 * Get all graphs for the current user
 */
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const graphs = await CustomGraph.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title description metadata settings isPublic createdAt updatedAt');

    const total = await CustomGraph.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      graphs,
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

/**
 * GET /api/graphs/demo/:sessionId
 * Get graphs for demo session
 */
router.get('/demo/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const graphs = await CustomGraph.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title description metadata createdAt');

    res.json({
      success: true,
      graphs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/graphs/:id
 * Get a specific graph
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const graph = await CustomGraph.findById(req.params.id);

    if (!graph) {
      return res.status(404).json({
        success: false,
        error: 'Graph not found'
      });
    }

    // Check access permissions
    const isOwner = req.user && graph.user?.toString() === req.user._id.toString();
    const isPublic = graph.isPublic;

    if (!isOwner && !isPublic) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      graph,
      isOwner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/graphs/:id
 * Update a graph
 */
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const { title, description, nodes, edges, settings, isPublic } = req.body;

    let query = { _id: req.params.id };
    
    // If authenticated, check ownership
    if (req.user) {
      query.user = req.user._id;
    }

    const updateData = {
      'metadata.lastEditedAt': new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (nodes !== undefined) {
      updateData.nodes = nodes;
      updateData['metadata.nodeCount'] = nodes.length;
    }
    if (edges !== undefined) {
      updateData.edges = edges;
      updateData['metadata.edgeCount'] = edges.length;
    }
    if (settings !== undefined) updateData.settings = settings;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const graph = await CustomGraph.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true }
    );

    if (!graph) {
      return res.status(404).json({
        success: false,
        error: 'Graph not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Graph updated successfully',
      graph: {
        id: graph._id,
        title: graph.title,
        nodeCount: graph.metadata.nodeCount,
        edgeCount: graph.metadata.edgeCount,
        updatedAt: graph.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/graphs/:id
 * Delete a graph
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const graph = await CustomGraph.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!graph) {
      return res.status(404).json({
        success: false,
        error: 'Graph not found'
      });
    }

    res.json({
      success: true,
      message: 'Graph deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/graphs/:id/duplicate
 * Duplicate a graph
 */
router.post('/:id/duplicate', protect, async (req, res) => {
  try {
    const originalGraph = await CustomGraph.findById(req.params.id);

    if (!originalGraph) {
      return res.status(404).json({
        success: false,
        error: 'Graph not found'
      });
    }

    // Check if user has access (owner or public)
    const isOwner = originalGraph.user?.toString() === req.user._id.toString();
    if (!isOwner && !originalGraph.isPublic) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Create duplicate
    const newGraph = await CustomGraph.create({
      user: req.user._id,
      title: `${originalGraph.title} (Copy)`,
      description: originalGraph.description,
      nodes: originalGraph.nodes,
      edges: originalGraph.edges,
      settings: originalGraph.settings,
      isPublic: false,
      metadata: {
        nodeCount: originalGraph.metadata.nodeCount,
        edgeCount: originalGraph.metadata.edgeCount,
        lastEditedAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Graph duplicated successfully',
      graph: {
        id: newGraph._id,
        title: newGraph.title
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
