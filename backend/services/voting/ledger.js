const crypto = require('crypto');
const Vote = require('../../shared/models/Vote');

async function generateLedgerHash(voteData) {
  // Find the previous vote to get the previous_hash
  const previousVote = await Vote.findOne().sort({ createdAt: -1 }).select('voteHash');
  const previous_hash = previousVote?.voteHash || '0'.repeat(64);

  // Payload structure as requested: hash = SHA256(vote + previous_hash)
  const payload = `${JSON.stringify(voteData)}|${previous_hash}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

module.exports = { generateLedgerHash };
