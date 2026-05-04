const Bulletin = require('../../shared/models/Bulletin');

exports.getActiveBulletins = async (req, res) => {
  try {
    const bulletins = await Bulletin.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(bulletins);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bulletins', error: error.message });
  }
};

exports.createBulletin = async (req, res) => {
  try {
    const { title, content, category, severity } = req.body;
    const bulletin = await Bulletin.create({ title, content, category, severity });
    res.status(201).json(bulletin);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create bulletin', error: error.message });
  }
};
