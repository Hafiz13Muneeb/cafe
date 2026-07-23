// server/middleware/auth.js - Session-based authentication middleware
const User = require('../models/User');

/**
 * Middleware to protect routes.
 * Verifies the session and attaches the authenticated user to `req.user`.
 *
 * Usage: router.get('/protected', protect, handler)
 */
const protect = async (req, res, next) => {
  try {
    // 1. Check if session exists and contains a userId
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in.',
      });
    }

    // 2. Fetch the user from the database
    const user = await User.findById(req.session.userId);
    if (!user) {
      // User was deleted – destroy the stale session
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(401).json({
        success: false,
        message: 'User not found. Please log in again.',
      });
    }

    // 3. Attach user to the request object for downstream use
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

/**
 * Role‑based restriction middleware (future‑proof).
 * Currently supports single‑cafe 'owner' role only.
 *
 * Usage: router.delete('/admin', protect, restrictTo('owner'), handler)
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // If no roles are specified, allow all (backward compatibility)
    if (!roles || roles.length === 0) {
      return next();
    }

    // Ensure user is attached (protect should have run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in.',
      });
    }

    // Check if the user's role is allowed
    if (roles.includes(req.user.role)) {
      return next();
    }

    // Role not permitted
    return res.status(403).json({
      success: false,
      message: 'Forbidden. You do not have permission to access this resource.',
    });
  };
};

module.exports = { protect, restrictTo };