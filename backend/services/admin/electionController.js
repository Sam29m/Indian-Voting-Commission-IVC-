const Election = require('../../shared/models/Election');
const AuditLog = require('../../shared/models/AuditLog');

exports.getElections = async (req, res) => {
  try {
    const { status, type } = req.query;
    const elections = await Election.find().populate('createdBy', 'name email').sort({ createdAt: -1 });

    const now = new Date();
    const updated = elections.map((election) => {
      if (election.status !== 'draft' && election.status !== 'cancelled') {
        let computed;
        if (now < election.startDate) computed = 'scheduled';
        else if (now >= election.startDate && now <= election.endDate) computed = 'active';
        else computed = 'completed';
        if (election.status !== computed) { election.status = computed; election.save(); }
      }
      return election;
    });

    let filtered = updated;
    if (status) filtered = filtered.filter(e => e.status === status);
    if (type) filtered = filtered.filter(e => e.type === type);
    res.json(filtered);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

exports.getElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate('createdBy', 'name email');
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const now = new Date();
    if (election.status !== 'draft' && election.status !== 'cancelled') {
      if (now < election.startDate) election.status = 'scheduled';
      else if (now >= election.startDate && now <= election.endDate) election.status = 'active';
      else election.status = 'completed';
      await election.save();
    }
    res.json(election);
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Election not found' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createElection = async (req, res) => {
  try {
    const { title, description, candidates, startDate, endDate, type, constituency } = req.body;
    if (!title || !description || !candidates || !startDate || !endDate) return res.status(400).json({ message: 'All fields are required' });
    if (candidates.length < 2) return res.status(400).json({ message: 'At least 2 candidates required' });
    if (new Date(endDate) <= new Date(startDate)) return res.status(400).json({ message: 'End date must be after start' });

    const election = await Election.create({
      title, description, candidates, startDate, endDate,
      type: type || 'general', constituency: constituency || 'National',
      status: 'scheduled', createdBy: req.user._id,
    });

    await AuditLog.log({ action: 'ELECTION_CREATED', userId: req.user._id, targetId: election._id.toString(), targetType: 'Election', details: `Created: ${title}`, ipAddress: req.ip });

    res.status(201).json(election);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

exports.updateElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    if (election.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    const allowed = ['title', 'description', 'candidates', 'startDate', 'endDate', 'type', 'constituency', 'status'];
    allowed.forEach(f => { if (req.body[f] !== undefined) election[f] = req.body[f]; });
    await election.save();

    await AuditLog.log({ action: 'ELECTION_UPDATED', userId: req.user._id, targetId: election._id.toString(), targetType: 'Election', details: `Updated: ${election.title}`, ipAddress: req.ip });

    res.json(election);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};
