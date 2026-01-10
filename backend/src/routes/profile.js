import express from 'express';
import User from '../models/User.js';
import History from '../models/History.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/profile
 * Get full user profile
 */
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password');

    // Get additional stats
    const totalGraphs = await History.countDocuments({ user: req.user._id });
    const graphStats = await History.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalConcepts: { $sum: '$conceptCount' },
          totalRelationships: { $sum: '$relationshipCount' }
        }
      }
    ]);

    res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        profession: user.profession,
        organization: user.organization,
        plan: user.plan,
        planExpiresAt: user.planExpiresAt,
        memberSince: user.createdAt,
        lastActive: user.stats?.lastActiveAt,
        stats: {
          totalGraphs,
          totalConcepts: graphStats[0]?.totalConcepts || 0,
          totalRelationships: graphStats[0]?.totalRelationships || 0
        }
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
 * PUT /api/profile
 * Update user profile
 */
router.put('/', protect, async (req, res) => {
  try {
    const { name, bio, profession, organization, avatar } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (profession !== undefined) updateData.profession = profession;
    if (organization !== undefined) updateData.organization = organization;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        profession: user.profession,
        organization: user.organization
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
 * PUT /api/profile/avatar
 * Update user avatar (base64 or URL)
 */
router.put('/avatar', protect, async (req, res) => {
  try {
    const { avatar } = req.body;

    // Validate avatar size (limit to ~500KB for base64)
    if (avatar && avatar.length > 700000) {
      return res.status(400).json({
        success: false,
        error: 'Avatar image is too large. Please use an image under 500KB.'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true }
    ).select('avatar');

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: user.avatar
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/profile/avatar
 * Remove user avatar
 */
router.delete('/avatar', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { avatar: null });

    res.json({
      success: true,
      message: 'Avatar removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/profile
 * Delete user account (with confirmation)
 */
router.delete('/', protect, async (req, res) => {
  try {
    const { confirmEmail } = req.body;
    const user = await User.findById(req.user._id);

    // Require email confirmation for account deletion
    if (confirmEmail !== user.email) {
      return res.status(400).json({
        success: false,
        error: 'Please confirm your email to delete your account'
      });
    }

    // Delete all user's history
    await History.deleteMany({ user: req.user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
