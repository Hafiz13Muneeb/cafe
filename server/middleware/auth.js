// server/middleware/auth.js - Simplified for single-cafe (no role)
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // Get the first user from the database
    let owner = await User.findOne();
    
    if (!owner) {
      // Fallback dummy (should only happen if DB is empty)
      owner = {
        _id: '000000000000000000000001',
        username: 'owner',
        cafeName: 'My Cafe',
        slug: 'cafe',
        whatsappNumber: '03001234567',
        tables: ['1', '2', '3', '4', '5'],
        theme: { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light' },
      };
    }

    req.user = owner;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401);
    next(new Error('Not authorized'));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    next();
  };
};

module.exports = { protect, restrictTo };