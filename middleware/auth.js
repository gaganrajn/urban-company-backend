const { verifyToken } = require('../utils/jwt');

const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login.',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message,
    });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
