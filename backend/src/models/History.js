import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  sourceType: {
    type: String,
    enum: ['text', 'pdf', 'import'],
    required: true
  },
  sourcePreview: {
    type: String,
    maxlength: 500
  },
  conceptCount: {
    type: Number,
    default: 0
  },
  relationshipCount: {
    type: Number,
    default: 0
  },
  graphData: {
    concepts: [String],
    relationships: [{
      source: String,
      relation: String,
      target: String
    }],
    nodes: [{
      id: String,
      label: String,
      connections: Number
    }],
    edges: [{
      id: String,
      source: String,
      target: String,
      label: String
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

historySchema.index({ user: 1, createdAt: -1 });

const History = mongoose.model('History', historySchema);

export default History;
