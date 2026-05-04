const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const { getAuditLogs, getAuditStats, verifyChain } = require('../controllers/auditController');

router.get('/', auth, isAdmin, getAuditLogs);
router.get('/stats', auth, isAdmin, getAuditStats);
router.get('/verify-chain', auth, isAdmin, verifyChain);

module.exports = router;
