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

    const user = await User.findOne({ phone });
    
    // Generate test OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (user) {
      user.otp = { code: otp, expiresAt };
      await user.save();
    } else {
      await User.create({
        phone,
        name: 'New User',
        otp: { code: otp, expiresAt },
      });
    }

    // Only show testOTP in development
    const response = {
      success: true,
      message: 'OTP sent successfully',
      phone,
    };
    
    if (process.env.NODE_ENV === 'development') {
      response.testOTP = otp;
    }

    return res.json(response);
  } catch (error) {
    console.error('sendOTP error:', error);
    
    // Check if response already sent
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Error sending OTP',
        error: error.message,
      });
    }
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name, email, role } = req.body;

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

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

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
        email: user.email,
        role: user.role,
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
