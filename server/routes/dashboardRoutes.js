const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { voterDashboard, candidateDashboard, adminDashboard } = require('../controllers/dashboardController');

router.get('/voter', auth, voterDashboard);
router.get('/candidate', auth, candidateDashboard);
router.get('/admin', auth, requireRole('admin'), adminDashboard);

module.exports = router;
