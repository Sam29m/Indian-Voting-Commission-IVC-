const User = require('../../shared/models/User');
const AuditLog = require('../../shared/models/AuditLog');

// @desc    Verify Aadhaar number (simulated)
// @route   POST /api/auth/verify-aadhaar
exports.verifyAadhaar = async (req, res) => {
  try {
    const { userId, aadhaarNumber } = req.body;

    if (!userId || !aadhaarNumber) {
      return res.status(400).json({ message: 'User ID and Aadhaar number are required' });
    }

    // Validate Aadhaar format (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({ message: 'Invalid Aadhaar format. Must be 12 digits.' });
    }

    // Simulated Aadhaar verification
    // In production, this would call UIDAI API
    const isValid = true; // Always succeeds in simulation

    if (!isValid) {
      return res.status(400).json({ message: 'Aadhaar verification failed' });
    }

    // Check if another user already has this Aadhaar
    const existingUser = await User.findOne({ 
      aadhaarNumber, 
      _id: { $ne: userId } 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'This Aadhaar is already linked to another account' });
    }

    await User.findByIdAndUpdate(userId, {
      aadhaarNumber,
      aadhaarVerified: true,
    });

    await AuditLog.log({
      action: 'AADHAAR_VERIFIED',
      userId,
      details: `Aadhaar verified: ${aadhaarNumber.slice(0, 4)}****${aadhaarNumber.slice(-4)}`,
      ipAddress: req.ip,
      severity: 'info',
    });

    // Simulated response with masked Aadhaar
    res.json({
      verified: true,
      maskedAadhaar: `${aadhaarNumber.slice(0, 4)} **** ${aadhaarNumber.slice(-4)}`,
      message: 'Aadhaar verified successfully',
      // Simulated UIDAI response
      uidaiResponse: {
        name: 'Verified',
        gender: 'N/A',
        state: 'Verified',
        status: 'VALID',
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Aadhaar verification failed', error: error.message });
  }
};

// @desc    Check Aadhaar status for a user
// @route   GET /api/auth/aadhaar-status/:userId
exports.getAadhaarStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      aadhaarVerified: user.aadhaarVerified,
      maskedAadhaar: user.aadhaarNumber 
        ? `${user.aadhaarNumber.slice(0, 4)} **** ${user.aadhaarNumber.slice(-4)}`
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check Aadhaar status', error: error.message });
  }
};
