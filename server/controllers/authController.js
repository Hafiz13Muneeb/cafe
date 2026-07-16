// server/controllers/authController.js - Single-cafe, .env credentials, no JWT
const User = require('../models/User');

// Read owner credentials from .env
const OWNER_USERNAME = process.env.OWNER_USERNAME || 'admin';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'admin123';

// @desc    Login user – compare with .env credentials
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400);
      throw new Error('Please provide username and password');
    }

    // Compare with .env
    if (username.trim() !== OWNER_USERNAME || password.trim() !== OWNER_PASSWORD) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Fetch the first owner from database (NO ROLE FILTER – field removed)
    let owner = await User.findOne();

    if (!owner) {
      // If no owner in DB, return a hardcoded owner object
      owner = {
        _id: '000000000000000000000001',
        username: OWNER_USERNAME,
        cafeName: 'My Cafe',
        slug: 'cafe',
        whatsappNumber: '03001234567',
        email: '',
        logoUrl: '',
        faviconUrl: '',
        tables: ['1', '2', '3', '4', '5'],
        theme: { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light' },
      };
    }

    // Prepare user response (without password)
    const userResponse = {
      id: owner._id,
      username: owner.username,
      cafeName: owner.cafeName || '',
      slug: owner.slug || '',
      whatsappNumber: owner.whatsappNumber || '',
      email: owner.email || '', // 🆕 Support email
      logoUrl: owner.logoUrl || '',
      faviconUrl: owner.faviconUrl || '',
      tables: owner.tables || [],
      theme: owner.theme || { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light' },
    };

    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user – clear session (just responds success)
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user profile – returns the owner from DB or dummy
// @route   GET /api/auth/me
// @access  Private (but protect middleware already attaches user)
const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401);
      throw new Error('Not authenticated');
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password – NOT needed for .env auth
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  res.status(501).json({
    success: false,
    message: 'Password change is handled locally. Please update your .env file.',
  });
};

// @desc    Update user profile – NOT needed (single-cafe)
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res, next) => {
  res.status(501).json({
    success: false,
    message: 'Profile updates are not supported in single-cafe mode.',
  });
};

// @desc    Create owner – NOT needed (single-cafe)
// @route   POST /api/auth/create-owner
// @access  Private
const createOwner = async (req, res, next) => {
  res.status(501).json({
    success: false,
    message: 'Creating new owners is not supported in single-cafe mode.',
  });
};

module.exports = {
  loginUser,
  logoutUser,
  getProfile,
  createOwner,
  changePassword,
  updateProfile,
};