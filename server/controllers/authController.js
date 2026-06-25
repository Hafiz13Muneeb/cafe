// controllers/authController.js - Authentication logic (login, get profile)
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400);
      throw new Error('Please provide username and password');
    }

    // Find admin by username and include password field
    const admin = await Admin.findOne({ username }).select('+password');

    if (!admin) {
      res.status(401);
      throw new Error('Invalid username or password');
    }

    // Check password
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid username or password');
    }

    // Return admin data and token
    res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        cafeName: admin.cafeName,
        whatsappNumber: admin.whatsappNumber,
        token: generateToken(admin._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin profile
// @route   GET /api/auth/me
// @access  Private
const getAdminProfile = async (req, res, next) => {
  try {
    // req.admin is set by the protect middleware
    const admin = await Admin.findById(req.admin._id).select('-password');

    if (!admin) {
      res.status(404);
      throw new Error('Admin not found');
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile,
};