const express = require('express');
const router = express.Router();
const { chat } = require('./aiController');

// Define APIs: /ai/query
router.post('/query', chat);
router.post('/chat', chat); // Keep chat just in case frontend relies on it

module.exports = router;
