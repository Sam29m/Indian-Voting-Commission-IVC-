const mongoose = require('mongoose');
const crypto = require('crypto');

const voteSchema = new mongoose.Schema(
  {
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    candidateName: {
      type: String,
      required: true,
    },
    candidateParty: {
      type: String,
      default: 'Independent',
    },
    receiptId: {
      type: String,
      unique: true,
    },
    // Hash of vote data for tamper detection
    voteHash: {
      type: String,
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Ensure one vote per user per election
voteSchema.index({ voter: 1, election: 1 }, { unique: true });

// Generate receipt ID and hash before save
voteSchema.pre('save', function (next) {
  if (!this.receiptId) {
    this.receiptId = 'RCP-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  }
  // Create tamper-aware hash
  const payload = `${this.voter}|${this.election}|${this.candidateId}|${this.createdAt || new Date().toISOString()}`;
  this.voteHash = crypto.createHash('sha256').update(payload).digest('hex');
  next();
});

module.exports = mongoose.model('Vote', voteSchema);
