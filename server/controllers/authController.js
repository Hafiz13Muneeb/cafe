// server/controllers/authController.js - Database-driven authentication
const User = require('../models/User');

// @desc    Login user – authenticate with MongoDB
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    // Find owner by username – include password field
    const owner = await User.findOne({ username: username.trim() }).select('+password');

    if (!owner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password using model method
    const isMatch = await owner.matchPassword(password.trim());
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Store user ID in session
    req.session.userId = owner._id;

    // Prepare user response (without password)
    const userResponse = {
      _id: owner._id,
      username: owner.username,
      cafeName: owner.cafeName || '',
      slug: owner.slug || '',
      whatsappNumber: owner.whatsappNumber || '',
      email: owner.email || '',
      logoUrl: owner.logoUrl || '',
      faviconUrl: owner.faviconUrl || '',
      tables: owner.tables || [],
      theme: owner.theme || { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light' },
    };

    res.status(200).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user – destroy session
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Could not log out',
        });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
// @access  Private (protect middleware attaches user)
const getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }
    const userResponse = {
      _id: req.user._id,
      username: req.user.username,
      cafeName: req.user.cafeName || '',
      slug: req.user.slug || '',
      whatsappNumber: req.user.whatsappNumber || '',
      email: req.user.email || '',
      logoUrl: req.user.logoUrl || '',
      faviconUrl: req.user.faviconUrl || '',
      tables: req.user.tables || [],
      theme: req.user.theme || { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light' },
    };
    res.status(200).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password – database-driven
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    // Get user from session
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in again.',
      });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  logoutUser,
  getProfile,
  changePassword,
};