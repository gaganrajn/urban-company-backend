const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  price: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  paymentId: {
    type: String,
    default: null,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  review: {
    type: String,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
