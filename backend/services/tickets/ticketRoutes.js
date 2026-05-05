const express = require('express');
const router = express.Router();
const { auth } = require('../../shared/middleware/auth');
const { isAdmin } = require('../../shared/middleware/rbac');
const { createTicket, getTickets, getTicket, updateTicket, respondToTicket, deleteTicket } = require('./ticketController');

router.post('/', auth, createTicket);
router.get('/', auth, getTickets);
router.get('/:id', auth, getTicket);
router.put('/:id', auth, isAdmin, updateTicket);
router.post('/:id/respond', auth, respondToTicket);
router.delete('/:id', auth, deleteTicket);

module.exports = router;
