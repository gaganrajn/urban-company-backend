const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  verified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  address: String,
  city: String,
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }]
}, {
  timestamps: true
});

// Hash password pre-save (if you add passwords later)
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

module.exports = mongoose.model('User', userSchema);