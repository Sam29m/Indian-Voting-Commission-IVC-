const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { castVote, getReceipt, checkVote, getVoteHistory } = require('../controllers/voteController');

router.post('/cast', auth, castVote);
router.get('/receipt/:receiptId', getReceipt);
router.get('/check/:electionId', auth, checkVote);
router.get('/history', auth, getVoteHistory);

module.exports = router;
