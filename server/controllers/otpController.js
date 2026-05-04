const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Send OTP to user's phone/email (simulated)
// @route   POST /api/auth/send-otp
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email }).select('+otpCode +otpExpiry');
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // In production, this would send SMS/email. For demo, we log it.
    console.log(`\n📱 OTP for ${email}: ${otp}\n`);

    await AuditLog.log({
      action: 'OTP_SENT',
      userId: user._id,
      details: `OTP sent to ${email}`,
      ipAddress: req.ip,
      severity: 'info',
    });

    res.json({ 
      message: 'OTP sent successfully',
      // Include OTP in response for demo purposes (remove in production)
      demo_otp: otp,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email }).select('+otpCode +otpExpiry');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = user.verifyOTP(otp);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP after successful verification
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    await AuditLog.log({
      action: 'OTP_VERIFIED',
      userId: user._id,
      details: `OTP verified for ${email}`,
      ipAddress: req.ip,
      severity: 'info',
    });

    res.json({ 
      verified: true, 
      userId: user._id,
      message: 'OTP verified successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};
