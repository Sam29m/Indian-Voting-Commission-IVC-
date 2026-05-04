const User = require('../../shared/models/User');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -otpCode -twoFactorSecret -faceDescriptor');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
