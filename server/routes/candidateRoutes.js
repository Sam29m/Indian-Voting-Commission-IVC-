const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getCandidates, getElectionCandidates, registerAsCandidate } = require('../controllers/candidateController');

router.get('/', getCandidates);
router.get('/election/:electionId', getElectionCandidates);
router.post('/register', auth, registerAsCandidate);

module.exports = router;
