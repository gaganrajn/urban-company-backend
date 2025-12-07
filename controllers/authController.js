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

    // ✅ REAL Fast2SMS
    const otpResult = await sendOTPViaSMS(phone);

    if (!otpResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP',
        error: otpResult.error,
      });
    }

    // Save to database
    const user = await User.findOne({ phone });
    if (user) {
      user.otp = {
        code: otpResult.otp,
        expiresAt: otpResult.expiresAt,
      };
      await user.save();
    } else {
      await User.create({
        phone,
        name: 'New User',
        otp: {
          code: otpResult.otp,
          expiresAt: otpResult.expiresAt,
        },
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      phone,
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

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found. Please send OTP first.',
      });
    }

    const otpVerification = verifyOTP(user.otp.code, otp, user.otp.expiresAt);

    if (!otpVerification.success) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message,
      });
    }

    // Clear OTP after verification
    user.otp = { code: null, expiresAt: null };
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email || null,
        role: user.role || 'user',
      },
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

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -otp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully. Please remove token from client.',
  });
};
