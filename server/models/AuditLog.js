const mongoose = require('mongoose');
const crypto = require('crypto');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTER',
        'USER_LOGIN',
        'USER_LOGOUT',
        'OTP_SENT',
        'OTP_VERIFIED',
        'AADHAAR_VERIFIED',
        'FACE_REGISTERED',
        'FACE_VERIFIED',
        '2FA_SETUP',
        '2FA_VERIFIED',
        'VOTE_CAST',
        'ELECTION_CREATED',
        'ELECTION_UPDATED',
        'ELECTION_STATUS_CHANGED',
        'CANDIDATE_REGISTERED',
        'TICKET_CREATED',
        'TICKET_UPDATED',
        'ADMIN_ACTION',
        'SYSTEM_EVENT',
      ],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    targetId: {
      type: String,
      default: '',
    },
    targetType: {
      type: String,
      enum: ['User', 'Election', 'Vote', 'Ticket', 'System', ''],
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    // Hash chain for tamper awareness
    previousHash: {
      type: String,
      default: '0'.repeat(64),
    },
    hash: {
      type: String,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
  },
  { timestamps: true }
);

// Compute hash before save to create chain
auditLogSchema.pre('save', async function (next) {
  if (!this.hash) {
    const payload = `${this.previousHash}|${this.action}|${this.userId}|${this.details}|${this.createdAt || new Date().toISOString()}`;
    this.hash = crypto.createHash('sha256').update(payload).digest('hex');
  }
  next();
});

// Static method to create audit entry with chain
auditLogSchema.statics.log = async function (data) {
  try {
    // Get the last entry's hash for chaining
    const lastEntry = await this.findOne().sort({ createdAt: -1 }).select('hash');
    const previousHash = lastEntry?.hash || '0'.repeat(64);

    const entry = new this({
      ...data,
      previousHash,
    });
    await entry.save();
    return entry;
  } catch (error) {
    console.error('Audit log failed:', error.message);
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
