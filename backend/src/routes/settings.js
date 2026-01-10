import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/settings
 * Get user settings
 */
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('settings');

    res.json({
      success: true,
      settings: user.settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/settings
 * Update user settings
 */
router.put('/', protect, async (req, res) => {
  try {
    const { 
      theme, 
      defaultLayout, 
      defaultNodeStyle, 
      defaultPalette,
      autoSaveHistory,
      emailNotifications,
      showTutorials
    } = req.body;

    const updateData = {};
    
    if (theme !== undefined) updateData['settings.theme'] = theme;
    if (defaultLayout !== undefined) updateData['settings.defaultLayout'] = defaultLayout;
    if (defaultNodeStyle !== undefined) updateData['settings.defaultNodeStyle'] = defaultNodeStyle;
    if (defaultPalette !== undefined) updateData['settings.defaultPalette'] = defaultPalette;
    if (autoSaveHistory !== undefined) updateData['settings.autoSaveHistory'] = autoSaveHistory;
    if (emailNotifications !== undefined) updateData['settings.emailNotifications'] = emailNotifications;
    if (showTutorials !== undefined) updateData['settings.showTutorials'] = showTutorials;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('settings');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/settings/reset
 * Reset settings to defaults
 */
router.put('/reset', protect, async (req, res) => {
  try {
    const defaultSettings = {
      theme: 'system',
      defaultLayout: 'dagre',
      defaultNodeStyle: 'standard',
      defaultPalette: 'academic',
      autoSaveHistory: true,
      emailNotifications: true,
      showTutorials: true
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { settings: defaultSettings },
      { new: true }
    ).select('settings');

    res.json({
      success: true,
      message: 'Settings reset to defaults',
      settings: user.settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
