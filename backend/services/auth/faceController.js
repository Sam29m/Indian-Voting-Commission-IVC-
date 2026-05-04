const User = require('../../shared/models/User');

// Euclidean distance between two descriptor arrays
function euclideanDistance(a, b) {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

const MATCH_THRESHOLD = 0.6;

// @desc    Register face descriptor
// @route   POST /api/auth/face/register
exports.registerFace = async (req, res) => {
  try {
    const { descriptor, userId } = req.body;
    const targetUserId = userId || req.user?._id;

    if (!targetUserId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ message: 'Valid 128-dimensional face descriptor is required' });
    }

    await User.findByIdAndUpdate(targetUserId, {
      faceDescriptor: descriptor,
      faceEnabled: true,
    });

    res.json({ message: 'Face registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register face', error: error.message });
  }
};

// @desc    Disable face auth
// @route   POST /api/auth/face/disable
exports.disableFace = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      faceEnabled: false,
      faceDescriptor: [],
    });
    res.json({ message: 'Face authentication disabled' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disable face auth', error: error.message });
  }
};

// @desc    Verify face descriptor during login
// @route   POST /api/auth/verify-face
exports.verifyFace = async (req, res) => {
  try {
    const { userId, descriptor } = req.body;

    if (!userId || !descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ message: 'User ID and valid face descriptor are required' });
    }

    const user = await User.findById(userId).select('+faceDescriptor');
    if (!user || !user.faceEnabled || !user.faceDescriptor || user.faceDescriptor.length === 0) {
      return res.status(400).json({ message: 'Face auth is not enabled for this user' });
    }

    const distance = euclideanDistance(descriptor, user.faceDescriptor);
    const matched = distance < MATCH_THRESHOLD;

    res.json({
      verified: matched,
      confidence: Math.max(0, Math.round((1 - distance) * 100)),
      distance: parseFloat(distance.toFixed(4)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Face verification failed', error: error.message });
  }
};
