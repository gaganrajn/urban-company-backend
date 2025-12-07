const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');

exports.createBooking = async (req, res) => {
  try {
    const { serviceId, scheduledDate, address, lat, lng, notes } = req.body;

    if (!serviceId || !scheduledDate || !address) {
      return res.status(400).json({
        success: false,
        message: 'serviceId, scheduledDate, and address are required',
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    const booking = await Booking.create({
      userId: req.user.userId,
      serviceId,
      scheduledDate,
      address,
      coordinates: { lat: lat || 0, lng: lng || 0 },
      price: service.basePrice,
      notes,
    });

    await booking.populate('userId serviceId');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message,
    });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId serviceId partnerId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message,
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .populate('serviceId partnerId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message,
    });
  }
};

exports.getPartnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' })
      .populate('userId serviceId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
      message: 'Available bookings for acceptance',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message,
    });
  }
};

exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'accepted',
        partnerId: req.user.userId,
      },
      { new: true }
    ).populate('userId serviceId partnerId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({
      success: true,
      message: 'Booking accepted successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accepting booking',
      error: error.message,
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'accepted', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const updateData = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId serviceId partnerId');

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message,
    });
  }
};

exports.rateBooking = async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { rating, review },
      { new: true }
    );

    const allPartnerBookings = await Booking.find({
      partnerId: booking.partnerId,
      rating: { $ne: null },
    });

    const avgRating =
      allPartnerBookings.reduce((sum, b) => sum + b.rating, 0) / allPartnerBookings.length;

    await User.findByIdAndUpdate(booking.partnerId, { rating: avgRating });

    res.json({
      success: true,
      message: 'Rating added successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding rating',
      error: error.message,
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('userId serviceId partnerId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message,
    });
  }
};
