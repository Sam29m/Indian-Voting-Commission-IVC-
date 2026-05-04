const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');

// @desc    Generate 2FA secret + QR code
// @route   POST /api/auth/2fa/setup
exports.setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `GVC (${req.user.email})`,
      issuer: 'General Voting Commission',
    });

    // Store secret temporarily (not enabled yet until verified)
    await User.findByIdAndUpdate(req.user._id, {
      twoFactorSecret: secret.base32,
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to setup 2FA', error: error.message });
  }
};

// @desc    Verify TOTP token and enable 2FA
// @route   POST /api/auth/2fa/verify
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: 'Please set up 2FA first' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
exports.disable2FA = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      twoFactorEnabled: false,
      twoFactorSecret: '',
    });
    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disable 2FA', error: error.message });
  }
};

// @desc    Validate a TOTP token during login
// @route   POST /api/auth/verify-2fa
exports.validateLogin2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token) {
      return res.status(400).json({ message: 'User ID and token are required' });
    }

    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled for this user' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2,
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid verification code' });
    }

    res.json({ verified: true });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};
