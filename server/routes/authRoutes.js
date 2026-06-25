// routes/authRoutes.js - Authentication routes
const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile, updateCredentials } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public route - Login
router.post('/login', loginAdmin);

// Protected route - Get admin profile
router.get('/me', protect, getAdminProfile);

// Protected route - Update username/password
router.put('/update-credentials', protect, updateCredentials);

module.exports = router;