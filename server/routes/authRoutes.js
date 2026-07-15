const express = require('express');
const router = express.Router();
const {
  loginUser,
  logoutUser,
  getProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected route – get profile (uses protect middleware)
router.get('/me', protect, getProfile);

// All other auth routes are removed (create-owner, change-password, update-profile)

module.exports = router;