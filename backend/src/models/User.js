import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null // URL or base64 image
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  profession: {
    type: String,
    maxlength: 100,
    default: ''
  },
  organization: {
    type: String,
    maxlength: 100,
    default: ''
  },
  // User settings/preferences
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    defaultLayout: {
      type: String,
      enum: ['dagre', 'radial', 'horizontal', 'vertical'],
      default: 'dagre'
    },
    defaultNodeStyle: {
      type: String,
      enum: ['standard', 'mindmap', 'flowchart', 'circle', 'hexagon'],
      default: 'standard'
    },
    defaultPalette: {
      type: String,
      enum: ['academic', 'research', 'modern', 'minimal', 'nature'],
      default: 'academic'
    },
    autoSaveHistory: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    showTutorials: {
      type: Boolean,
      default: true
    }
  },
  // Usage statistics
  stats: {
    totalGraphsCreated: {
      type: Number,
      default: 0
    },
    totalConceptsGenerated: {
      type: Number,
      default: 0
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    }
  },
  // Subscription/Plan info
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  planExpiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Update last active timestamp
userSchema.methods.updateActivity = async function() {
  this.stats.lastActiveAt = new Date();
  await this.save();
};

// Increment graph count
userSchema.methods.incrementGraphCount = async function(conceptCount = 0) {
  this.stats.totalGraphsCreated += 1;
  this.stats.totalConceptsGenerated += conceptCount;
  this.stats.lastActiveAt = new Date();
  await this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
