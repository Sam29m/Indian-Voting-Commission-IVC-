const express = require('express');
const router = express.Router();
const {
  getElections,
  getElection,
  createElection,
  updateElection,
} = require('../controllers/electionController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', getElections);
router.get('/:id', getElection);
router.post('/', auth, adminOnly, createElection);
router.put('/:id', auth, adminOnly, updateElection);

module.exports = router;
