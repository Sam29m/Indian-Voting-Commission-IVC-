const express = require('express');
const router = express.Router();
const { register, login, getMe, completeLogin } = require('./authController');
const { sendOTP, verifyOTP } = require('./otpController');
const { verifyAadhaar, getAadhaarStatus } = require('./aadhaarController');
const { setup2FA, verify2FA, disable2FA, validateLogin2FA } = require('./twoFactorController');
const { registerFace, disableFace, verifyFace } = require('./faceController');

const { auth } = require('../../shared/middleware/auth');
const { authRateLimit } = require('../../shared/middleware/rateLimiter');

// Base endpoints
router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);
router.post('/complete-login', authRateLimit, completeLogin);
router.get('/me', auth, getMe);

// OTP endpoints
router.post('/send-otp', authRateLimit, sendOTP);
router.post('/verify-otp', authRateLimit, verifyOTP);

// Aadhaar endpoints
router.post('/verify-aadhaar', authRateLimit, verifyAadhaar);
router.get('/aadhaar-status/:userId', getAadhaarStatus);

// 2FA routes (authenticated)
router.post('/2fa/setup', auth, setup2FA);
router.post('/2fa/verify', auth, verify2FA);
router.post('/2fa/disable', auth, disable2FA);

// 2FA login verification (unauthenticated — uses userId)
router.post('/verify-2fa', validateLogin2FA);

// Face auth routes
router.post('/face/register', registerFace);
router.post('/face/disable', auth, disableFace);

// Face login verification (unauthenticated — uses userId)
router.post('/verify-face', verifyFace);

module.exports = router;
