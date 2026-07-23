const express = require('express');
const router = express.Router();
const {
  loginUser,
  logoutUser,
  getProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/login', loginUser);

// Protected routes (require session)
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;