const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get the token from the header (it looks like "Bearer eyJhbGciOi...")
      token = req.headers.authorization.split(' ')[1];

      // Decode the token to find the user's ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');

      // Find the user in the database and attach them to the request
      // We use .select('-password') to make sure we don't accidentally send the password around
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Let the request continue to the actual route
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if the user is a seller
const sellerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. You must be a seller to do this.' });
  }
};

module.exports = { protect, sellerOnly };
