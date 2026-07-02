const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware – verifies JWT and attaches user to req.user
 * Also checks if the user is blocked (isBlocked === true)
 * Supports token from Authorization header (Bearer) or from httpOnly cookie
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Try to get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 🆕 2. If not in header, try to get from cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 3. If no token found, return 401
  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }

  try {
    // 4. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Fetch user from database (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    // 6. Check if the user is blocked
    if (user.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked. Please contact support.');
    }

    // 7. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      res.status(401);
      error.message = 'Not authorized, invalid or expired token';
    }
    // If status code not set, default to 401
    if (res.statusCode === 200) res.status(401);
    next(error);
  }
};

/**
 * Restrict to specific roles – e.g., restrictTo('superadmin')
 * Must be used after protect()
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized, please log in'));
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('You do not have permission to perform this action'));
    }
    next();
  };
};

module.exports = { protect, restrictTo };