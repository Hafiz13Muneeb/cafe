const express = require('express');
const router = express.Router();
const {
  loginUser,
  logoutUser,
  getProfile,
  createOwner,
  registerOwner,
  sendOTP,       // 🆕
  verifyOTP,     // 🆕
  changePassword,
  updateProfile,
} = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

// ============================================================
// PUBLIC ROUTES (no authentication required)
// ============================================================

// Login
router.post('/login', loginUser);

// Logout (clears the httpOnly cookie)
router.post('/logout', logoutUser);

// Public registration for new cafe owners
router.post('/register', registerOwner);

// 🆕 Send OTP to email
router.post('/send-otp', sendOTP);

// 🆕 Verify OTP
router.post('/verify-otp', verifyOTP);

// ============================================================
// PROTECTED ROUTES (any logged-in user)
// ============================================================

// Get current user profile
router.get('/me', protect, getProfile);

// Change password
router.put('/change-password', protect, changePassword);

// Update profile (username, email)
router.put('/update-profile', protect, updateProfile);

// ============================================================
// SUPER-ADMIN ONLY
// ============================================================

// Create a new cafe owner (superadmin only)
router.post('/create-owner', protect, restrictTo('superadmin'), createOwner);

module.exports = router;