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

// @desc    Update admin credentials (username / password)
// @route   PUT /api/auth/update-credentials
// @access  Private
const updateCredentials = async (req, res, next) => {
  try {
    const { newUsername, oldPassword, newPassword } = req.body;

    // Validate that old password is provided
    if (!oldPassword) {
      res.status(400);
      throw new Error('Please provide your current password to make changes');
    }

    // Find admin by ID, must select password explicitly since it's deselected by default in schema
    const admin = await Admin.findById(req.admin._id).select('+password');
    if (!admin) {
      res.status(404);
      throw new Error('Admin not found');
    }

    // Verify current password
    const isMatch = await admin.matchPassword(oldPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error('Incorrect current password');
    }

    // If new username is provided
    if (newUsername && newUsername.trim() !== '') {
      const trimmedUsername = newUsername.trim();
      
      if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
        res.status(400);
        throw new Error('Username must be between 3 and 30 characters');
      }

      const usernameExists = await Admin.findOne({ username: trimmedUsername, _id: { $ne: admin._id } });
      if (usernameExists) {
        res.status(400);
        throw new Error('Username is already taken');
      }
      admin.username = trimmedUsername;
    }

    // If new password is provided
    if (newPassword && newPassword.trim() !== '') {
      if (newPassword.length < 6) {
        res.status(400);
        throw new Error('New password must be at least 6 characters long');
      }
      admin.password = newPassword; // This will trigger the pre-save password hashing hook on the Admin model
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Credentials updated successfully',
      data: {
        id: admin._id,
        username: admin.username,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  updateCredentials,
};