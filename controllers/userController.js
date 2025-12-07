const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -otp');

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp');

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

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, address, city, profilePic } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        name: name || undefined,
        email: email || undefined,
        address: address || undefined,
        city: city || undefined,
        profilePic: profilePic || undefined,
      },
      { new: true, runValidators: true }
    ).select('-password -otp');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

exports.getAllPartners = async (req, res) => {
  try {
    const partners = await User.find({
      role: 'partner',
      isVerified: true,
    })
      .select('-password -otp')
      .populate('services');

    res.json({
      success: true,
      count: partners.length,
      partners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching partners',
      error: error.message,
    });
  }
};

exports.getPartnersNearby = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const partners = await User.find({
      role: 'partner',
      isVerified: true,
    }).select('-password -otp');

    res.json({
      success: true,
      count: partners.length,
      partners,
      note: 'Geospatial filtering will be added in Phase 2',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby partners',
      error: error.message,
    });
  }
};

exports.disableUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.json({
      success: true,
      message: 'User disabled successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error disabling user',
      error: error.message,
    });
  }
};
