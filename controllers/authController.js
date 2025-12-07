const User = require('../models/User');
const { generateOTP, sendOTPViaSMS, verifyOTP } = require('../utils/otp');
const { generateToken } = require('../utils/jwt');

exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number',
      });
    }

    // ✅ Generate OTP without ANY database
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    res.json({
      success: true,
      message: 'OTP generated successfully',
      phone,
      testOTP: otp,  // Copy this from Network tab
    });
  } catch (error) {
    console.error('sendOTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    // ✅ TEST MODE: Accept ANY 6-digit OTP for testing
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 6-digit OTP',
      });
    }

    // Generate fake token for testing
    const fakeToken = 'test-jwt-token-' + Math.random().toString(36).substr(2, 9);
    
    res.json({
      success: true,
      message: 'Login successful!',
      token: fakeToken,
      user: {
        _id: 'test-user-id',
        phone,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    return exports.sendOTP(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

const { verifyToken } = require('../utils/jwt');

exports.getCurrentUser = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-otp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token'
    });
  }
};

exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully. Please remove token from client.',
  });
};
