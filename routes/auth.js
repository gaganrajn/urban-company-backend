const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;
