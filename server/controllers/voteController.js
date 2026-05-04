const Vote = require('../models/Vote');
const Election = require('../models/Election');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Cast a vote
// @route   POST /api/votes/cast
exports.castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const voterId = req.user._id;

    if (!electionId || !candidateId) {
      return res.status(400).json({ message: 'Election ID and candidate ID are required' });
    }

    // Check election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Recompute status
    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      return res.status(400).json({ message: 'This election is not currently active for voting' });
    }

    // Check candidate exists in this election
    const candidate = election.candidates.id(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found in this election' });
    }

    // Check if user already voted in this election
    const existingVote = await Vote.findOne({ voter: voterId, election: electionId });
    if (existingVote) {
      return res.status(400).json({ 
        message: 'You have already voted in this election',
        receiptId: existingVote.receiptId,
      });
    }

    // Cast the vote
    const vote = await Vote.create({
      voter: voterId,
      election: electionId,
      candidateId: candidateId,
      candidateName: candidate.name,
      candidateParty: candidate.party,
      ipAddress: req.ip,
    });

    // Increment vote count on the candidate
    candidate.voteCount = (candidate.voteCount || 0) + 1;
    election.totalVotesCast = (election.totalVotesCast || 0) + 1;
    await election.save();

    // Mark user as having voted in this election
    await User.findByIdAndUpdate(voterId, {
      $addToSet: { votedElections: electionId },
    });

    // Audit log
    await AuditLog.log({
      action: 'VOTE_CAST',
      userId: voterId,
      targetId: electionId.toString(),
      targetType: 'Vote',
      details: `Vote cast in "${election.title}" — Receipt: ${vote.receiptId}`,
      ipAddress: req.ip,
      severity: 'critical',
    });

    res.status(201).json({
      message: 'Vote cast successfully!',
      receipt: {
        receiptId: vote.receiptId,
        election: election.title,
        candidateName: candidate.name,
        candidateParty: candidate.party,
        timestamp: vote.createdAt,
        voteHash: vote.voteHash,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }
    res.status(500).json({ message: 'Failed to cast vote', error: error.message });
  }
};

// @desc    Get voting receipt
// @route   GET /api/votes/receipt/:receiptId
exports.getReceipt = async (req, res) => {
  try {
    const vote = await Vote.findOne({ receiptId: req.params.receiptId })
      .populate('election', 'title type constituency')
      .populate('voter', 'name voterId');

    if (!vote) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json({
      receiptId: vote.receiptId,
      voterName: vote.voter?.name || 'Anonymous',
      voterId: vote.voter?.voterId || 'N/A',
      election: vote.election?.title || 'Unknown',
      electionType: vote.election?.type || 'general',
      candidateName: vote.candidateName,
      candidateParty: vote.candidateParty,
      timestamp: vote.createdAt,
      voteHash: vote.voteHash,
      verified: true,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve receipt', error: error.message });
  }
};

// @desc    Check if current user has voted in an election
// @route   GET /api/votes/check/:electionId
exports.checkVote = async (req, res) => {
  try {
    const vote = await Vote.findOne({
      voter: req.user._id,
      election: req.params.electionId,
    });

    res.json({
      hasVoted: !!vote,
      receiptId: vote?.receiptId || null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check vote status', error: error.message });
  }
};

// @desc    Get user's vote history
// @route   GET /api/votes/history
exports.getVoteHistory = async (req, res) => {
  try {
    const votes = await Vote.find({ voter: req.user._id })
      .populate('election', 'title type constituency status startDate endDate')
      .sort({ createdAt: -1 });

    res.json(votes.map(v => ({
      receiptId: v.receiptId,
      election: v.election?.title || 'Unknown',
      electionType: v.election?.type || 'general',
      candidateName: v.candidateName,
      candidateParty: v.candidateParty,
      timestamp: v.createdAt,
      status: v.election?.status || 'completed',
    })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to get vote history', error: error.message });
  }
};
