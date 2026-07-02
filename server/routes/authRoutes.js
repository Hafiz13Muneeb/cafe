const express = require('express');
const router = express.Router();
const {
  loginUser,
  logoutUser, // 🆕 imported
  getProfile,
  createOwner,
  changePassword,
  updateProfile,
} = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.post('/login', loginUser);
// 🆕 Logout route (public because it just clears the cookie)
router.post('/logout', logoutUser);

// Protected routes (any logged-in user)
router.get('/me', protect, getProfile);
router.put('/change-password', protect, changePassword);
router.put('/update-profile', protect, updateProfile);

// Super-admin only route – create a new cafe owner
router.post('/create-owner', protect, restrictTo('superadmin'), createOwner);

module.exports = router;