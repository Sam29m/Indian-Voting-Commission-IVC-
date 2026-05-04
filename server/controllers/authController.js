const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { JWT_SECRET } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, constituency } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, phone, constituency });
    const token = generateToken(user._id);

    await AuditLog.log({ action: 'USER_REGISTER', userId: user._id, details: `New user: ${email}`, ipAddress: req.ip });

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, constituency: user.constituency, voterId: user.voterId },
    });
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    await AuditLog.log({ action: 'USER_LOGIN', userId: user._id, details: `Login: ${email}`, ipAddress: req.ip });

    // For Triple-Lock: always send OTP on login
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });
    console.log(`\n📱 OTP for ${email}: ${otp}\n`);

    res.json({
      requiresMFA: true,
      requires2FA: user.twoFactorEnabled,
      requiresFace: user.faceEnabled,
      userId: user._id,
      userName: user.name,
      demo_otp: otp,
    });
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    res.json({
      user: {
        _id: req.user._id, name: req.user.name, email: req.user.email,
        role: req.user.role, phone: req.user.phone, constituency: req.user.constituency,
        voterId: req.user.voterId, aadhaarVerified: req.user.aadhaarVerified,
        twoFactorEnabled: req.user.twoFactorEnabled, faceEnabled: req.user.faceEnabled,
      },
    });
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

// @desc    Complete login after MFA verification
// @route   POST /api/auth/complete-login
exports.completeLogin = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, phone: user.phone, constituency: user.constituency,
        voterId: user.voterId, aadhaarVerified: user.aadhaarVerified,
        twoFactorEnabled: user.twoFactorEnabled, faceEnabled: user.faceEnabled,
      },
    });
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};
