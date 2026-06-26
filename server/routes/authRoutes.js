const express = require('express');
const router = express.Router();
const { loginUser, getProfile, createOwner } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.post('/login', loginUser);

// Protected routes (any logged-in user)
router.get('/me', protect, getProfile);

// Super-admin only route – create a new cafe owner
router.post('/create-owner', protect, restrictTo('superadmin'), createOwner);

module.exports = router;