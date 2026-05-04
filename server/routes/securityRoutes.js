const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { setup2FA, verify2FA, disable2FA, validateLogin2FA } = require('../controllers/twoFactorController');
const { registerFace, disableFace, verifyFace } = require('../controllers/faceController');

// 2FA routes (authenticated)
router.post('/2fa/setup', auth, setup2FA);
router.post('/2fa/verify', auth, verify2FA);
router.post('/2fa/disable', auth, disable2FA);

// 2FA login verification (unauthenticated — uses userId)
router.post('/verify-2fa', validateLogin2FA);

// Face auth routes (authenticated)
router.post('/face/register', auth, registerFace);
router.post('/face/disable', auth, disableFace);

// Face login verification (unauthenticated — uses userId)
router.post('/verify-face', verifyFace);

module.exports = router;
