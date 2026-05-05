const express = require('express');
const router = express.Router();
const { chat } = require('./aiController');
const { auth } = require('../../shared/middleware/auth');
const { rateLimit } = require('../../shared/middleware/rateLimiter');

// Rate limiting for AI chat (stricter than general API)
const aiRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 30, // 30 requests per 5 minutes
  message: 'Too many AI chat requests. Mitra needs a break! Try again in a few minutes.',
});

// AI chat endpoints - requires authentication + rate limiting
router.post('/query', auth, aiRateLimit, chat);
router.post('/chat', auth, aiRateLimit, chat);

// Optional: Allow unauthenticated access with stricter rate limiting (for guests)
const guestRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 5, // 5 requests per 10 minutes
  message: 'Guest chat limit exceeded. Please login or create a support ticket.',
});

router.post('/guest-chat', guestRateLimit, chat); // For non-logged-in users

module.exports = router;
