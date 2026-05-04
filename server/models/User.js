const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['voter', 'candidate', 'admin'],
      default: 'voter',
    },

    // Aadhaar simulation
    aadhaarNumber: {
      type: String,
      trim: true,
      match: [/^\d{12}$/, 'Aadhaar must be 12 digits'],
    },
    aadhaarVerified: {
      type: Boolean,
      default: false,
    },

    // Voter ID
    voterId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Constituency
    constituency: {
      type: String,
      trim: true,
      default: '',
    },

    // OTP fields
    otpCode: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },

    // 2FA (TOTP)
    twoFactorSecret: {
      type: String,
      select: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // Face recognition
    faceDescriptor: {
      type: [Number],
      select: false,
    },
    faceEnabled: {
      type: Boolean,
      default: false,
    },

    // Profile
    profilePhoto: {
      type: String,
      default: '',
    },

    // Candidate-specific
    party: {
      type: String,
      default: '',
    },
    manifesto: {
      type: String,
      default: '',
    },

    // Track which elections the user has voted in
    votedElections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
    }],

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-generate voterId before save
userSchema.pre('save', async function (next) {
  if (!this.voterId) {
    this.voterId = 'IVC' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpCode = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function (code) {
  if (!this.otpCode || !this.otpExpiry) return false;
  if (new Date() > this.otpExpiry) return false;
  return this.otpCode === code;
};

module.exports = mongoose.model('User', userSchema);
