const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be null for guest chats
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastInteraction: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for cleanup and quick retrieval
conversationSchema.index({ userId: 1, lastInteraction: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
