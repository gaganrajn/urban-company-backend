const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['cleaning', 'repairs', 'beauty', 'fitness', 'cooking', 'other'],
    required: true,
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
  },
  icon: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  estimatedTime: {
    type: Number,
    default: 60,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Service', serviceSchema);
