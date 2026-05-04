const mongoose = require('mongoose');

const candidateEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: { type: String, required: true },
  party: { type: String, default: 'Independent' },
  symbol: { type: String, default: '🏛️' },
  manifesto: { type: String, default: '' },
  voteCount: { type: Number, default: 0 },
});

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Election title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['general', 'state', 'local', 'referendum', 'by-election'],
      default: 'general',
    },
    constituency: {
      type: String,
      default: 'National',
    },
    candidates: [candidateEntrySchema],
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },
    totalRegisteredVoters: {
      type: Number,
      default: 0,
    },
    totalVotesCast: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-compute status based on dates
electionSchema.pre('save', function (next) {
  const now = new Date();
  if (this.status === 'cancelled') return next();
  if (this.status === 'draft') return next();
  if (now < this.startDate) {
    this.status = 'scheduled';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'active';
  } else {
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Election', electionSchema);
