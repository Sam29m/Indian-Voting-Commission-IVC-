const SupportTicket = require('../models/SupportTicket');
const AuditLog = require('../models/AuditLog');

exports.createTicket = async (req, res) => {
  try {
    const { category, subject, description, priority } = req.body;
    if (!category || !subject || !description) {
      return res.status(400).json({ message: 'Category, subject, and description are required' });
    }
    const ticket = await SupportTicket.create({
      userId: req.user._id, userName: req.user.name,
      category, subject, description, priority: priority || 'medium',
    });
    await AuditLog.log({ action: 'TICKET_CREATED', userId: req.user._id, targetId: ticket._id.toString(), targetType: 'Ticket', details: `Ticket: ${subject}`, ipAddress: req.ip });
    res.status(201).json(ticket);
  } catch (error) { res.status(500).json({ message: 'Failed to create ticket', error: error.message }); }
};

exports.getTickets = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (req.user.role !== 'admin') query.userId = req.user._id;
    if (status) query.status = status;
    const total = await SupportTicket.countDocuments(query);
    const tickets = await SupportTicket.find(query).populate('userId', 'name email role').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ tickets, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ message: 'Failed to fetch tickets', error: error.message }); }
};

exports.getTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('userId', 'name email role');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role !== 'admin' && ticket.userId._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    res.json(ticket);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch ticket', error: error.message }); }
};

exports.updateTicket = async (req, res) => {
  try {
    const { status, priority } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (status) { ticket.status = status; if (status === 'resolved') ticket.resolvedAt = new Date(); }
    if (priority) ticket.priority = priority;
    await ticket.save();
    await AuditLog.log({ action: 'TICKET_UPDATED', userId: req.user._id, targetId: ticket._id.toString(), targetType: 'Ticket', details: `Status=${status||'same'}`, ipAddress: req.ip });
    res.json(ticket);
  } catch (error) { res.status(500).json({ message: 'Failed to update ticket', error: error.message }); }
};

exports.respondToTicket = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role !== 'admin' && ticket.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    ticket.responses.push({ author: req.user._id, authorName: req.user.name, authorRole: req.user.role, message });
    if (req.user.role === 'admin' && ticket.status === 'open') ticket.status = 'in_progress';
    await ticket.save();
    res.json(ticket);
  } catch (error) { res.status(500).json({ message: 'Failed to respond', error: error.message }); }
};
