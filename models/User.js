const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'partner', 'admin'],
    default: 'user',
  },
  profilePic: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  }],
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5,
  },
  totalBookings: {
    type: Number,
    default: 0,
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolder: String,
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
  },
  otp: {
    code: String,
    expiresAt: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
