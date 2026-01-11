import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'graph', 'system', 'welcome'],
    default: 'info'
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: 500
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: null // Optional link to navigate to
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {} // Additional data like graphId, historyId, etc.
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

// Static method to create welcome notification for new users
notificationSchema.statics.createWelcomeNotification = async function(userId) {
  return this.create({
    user: userId,
    type: 'welcome',
    title: 'Welcome to MindMap AI! 🎉',
    message: 'Start creating beautiful knowledge graphs from your text, documents, or build them manually with our drag & drop builder.',
    link: '/create'
  });
};

// Static method to create graph saved notification
notificationSchema.statics.createGraphNotification = async function(userId, graphTitle, graphId) {
  return this.create({
    user: userId,
    type: 'graph',
    title: 'Graph Saved Successfully',
    message: `Your graph "${graphTitle}" has been saved.`,
    link: `/graphs/${graphId}`,
    metadata: { graphId }
  });
};

// Static method to create system notification
notificationSchema.statics.createSystemNotification = async function(userId, title, message, link = null) {
  return this.create({
    user: userId,
    type: 'system',
    title,
    message,
    link
  });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  return this.save();
};

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const seconds = Math.floor((new Date() - this.createdAt) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
  return this.createdAt.toLocaleDateString();
});

// Ensure virtuals are included in JSON
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
