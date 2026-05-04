const express = require('express');
const router = express.Router();
const { register, login, getMe, completeLogin } = require('../controllers/authController');
const { sendOTP, verifyOTP } = require('../controllers/otpController');
const { verifyAadhaar, getAadhaarStatus } = require('../controllers/aadhaarController');
const { auth } = require('../middleware/auth');
const { authRateLimit } = require('../middleware/rateLimiter');

router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);
router.post('/complete-login', authRateLimit, completeLogin);
router.get('/me', auth, getMe);

// OTP
router.post('/send-otp', authRateLimit, sendOTP);
router.post('/verify-otp', authRateLimit, verifyOTP);

// Aadhaar
router.post('/verify-aadhaar', authRateLimit, verifyAadhaar);
router.get('/aadhaar-status/:userId', getAadhaarStatus);

module.exports = router;
