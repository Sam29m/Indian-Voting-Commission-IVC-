const User = require('../models/User');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const AuditLog = require('../models/AuditLog');
const SupportTicket = require('../models/SupportTicket');

exports.voterDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const totalElections = await Election.countDocuments({ status: { $in: ['active', 'scheduled', 'completed'] } });
    const activeElections = await Election.find({ status: 'active' }).select('title startDate endDate type constituency').limit(5);
    const myVotes = await Vote.find({ voter: userId }).populate('election', 'title status type').sort({ createdAt: -1 });
    const upcomingElections = await Election.find({ status: 'scheduled' }).select('title startDate endDate type').limit(5);

    res.json({
      stats: { totalElections, votesPlaced: myVotes.length, activeElections: activeElections.length, upcomingCount: upcomingElections.length },
      activeElections, upcomingElections,
      recentVotes: myVotes.slice(0, 5).map(v => ({ receiptId: v.receiptId, election: v.election?.title, candidateName: v.candidateName, candidateParty: v.candidateParty, timestamp: v.createdAt })),
    });
  } catch (error) { res.status(500).json({ message: 'Dashboard error', error: error.message }); }
};

exports.candidateDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const elections = await Election.find({ 'candidates.userId': userId });
    const totalVotesReceived = elections.reduce((sum, e) => {
      const c = e.candidates.find(c => c.userId && c.userId.toString() === userId.toString());
      return sum + (c?.voteCount || 0);
    }, 0);

    res.json({
      stats: { electionsRegistered: elections.length, totalVotesReceived, party: user.party || 'Independent' },
      elections: elections.map(e => {
        const c = e.candidates.find(c => c.userId && c.userId.toString() === userId.toString());
        return { _id: e._id, title: e.title, status: e.status, type: e.type, startDate: e.startDate, endDate: e.endDate, myVotes: c?.voteCount || 0, totalCandidates: e.candidates.length };
      }),
    });
  } catch (error) { res.status(500).json({ message: 'Dashboard error', error: error.message }); }
};

exports.adminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const voterCount = await User.countDocuments({ role: 'voter' });
    const candidateCount = await User.countDocuments({ role: 'candidate' });
    const totalElections = await Election.countDocuments();
    const activeElections = await Election.countDocuments({ status: 'active' });
    const totalVotes = await Vote.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } });
    const recentLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name role');
    const recentElections = await Election.find().sort({ createdAt: -1 }).limit(5).select('title status type totalVotesCast');

    res.json({
      stats: { totalUsers, voterCount, candidateCount, totalElections, activeElections, totalVotes, openTickets },
      recentLogs: recentLogs.map(l => ({ action: l.action, user: l.userId?.name, details: l.details, time: l.createdAt, severity: l.severity })),
      recentElections,
    });
  } catch (error) { res.status(500).json({ message: 'Dashboard error', error: error.message }); }
};
