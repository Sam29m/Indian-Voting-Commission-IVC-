const express = require('express');
const router = express.Router();
const { getActiveBulletins, createBulletin } = require('./bulletinController');
const { auth } = require('../../shared/middleware/auth');
const { isAdmin } = require('../../shared/middleware/rbac');

router.get('/', getActiveBulletins);
router.post('/', auth, isAdmin, createBulletin);

module.exports = router;
