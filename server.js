require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');

// Initialize app
const app = express();

// CORS config
const allowedOrigins = [
  'https://urban-company-frontend.vercel.app',
  'http://localhost:5500',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow Postman / curl with no origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running ✅' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Only handle if response not already sent
  if (res.headersSent) {
    return next(err);
  }
  
  console.error('Global error handler:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API Health: http://localhost:${PORT}/api/health`);
});
