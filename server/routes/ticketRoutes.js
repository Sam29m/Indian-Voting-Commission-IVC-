const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const { createTicket, getTickets, getTicket, updateTicket, respondToTicket } = require('../controllers/ticketController');

router.post('/', auth, createTicket);
router.get('/', auth, getTickets);
router.get('/:id', auth, getTicket);
router.put('/:id', auth, isAdmin, updateTicket);
router.post('/:id/respond', auth, respondToTicket);

module.exports = router;
