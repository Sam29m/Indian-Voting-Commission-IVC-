const Election = require('../models/Election');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get all candidates (optionally by election)
// @route   GET /api/candidates?electionId=xxx
exports.getCandidates = async (req, res) => {
  try {
    const { electionId } = req.query;

    if (electionId) {
      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ message: 'Election not found' });
      }
      return res.json({
        election: election.title,
        candidates: election.candidates,
      });
    }

    // Get all users with candidate role
    const candidates = await User.find({ role: 'candidate' })
      .select('name email party constituency manifesto profilePhoto');

    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch candidates', error: error.message });
  }
};

// @desc    Get candidates for a specific election
// @route   GET /api/candidates/election/:electionId
exports.getElectionCandidates = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    res.json({
      electionId: election._id,
      electionTitle: election.title,
      candidates: election.candidates.map(c => ({
        _id: c._id,
        name: c.name,
        party: c.party,
        symbol: c.symbol,
        manifesto: c.manifesto,
        voteCount: election.status === 'completed' ? c.voteCount : undefined,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch candidates', error: error.message });
  }
};

// @desc    Register as candidate for an election
// @route   POST /api/candidates/register
exports.registerAsCandidate = async (req, res) => {
  try {
    const { electionId, manifesto } = req.body;
    const userId = req.user._id;

    if (!electionId) {
      return res.status(400).json({ message: 'Election ID is required' });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Only allow registration before election starts
    if (new Date() >= election.startDate) {
      return res.status(400).json({ message: 'Cannot register after election has started' });
    }

    // Check if user is already a candidate
    const alreadyRegistered = election.candidates.some(
      c => c.userId && c.userId.toString() === userId.toString()
    );
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this election' });
    }

    const user = await User.findById(userId);

    election.candidates.push({
      userId: userId,
      name: user.name,
      party: user.party || req.body.party || 'Independent',
      symbol: req.body.symbol || '🏛️',
      manifesto: manifesto || user.manifesto || '',
    });

    await election.save();

    // Update user role to candidate if they're a voter
    if (user.role === 'voter') {
      user.role = 'candidate';
      if (req.body.party) user.party = req.body.party;
      if (manifesto) user.manifesto = manifesto;
      await user.save();
    }

    await AuditLog.log({
      action: 'CANDIDATE_REGISTERED',
      userId,
      targetId: electionId,
      targetType: 'Election',
      details: `${user.name} registered as candidate in "${election.title}"`,
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'Successfully registered as candidate', election: election.title });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register as candidate', error: error.message });
  }
};
