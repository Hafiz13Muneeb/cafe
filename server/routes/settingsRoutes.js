// routes/settingsRoutes.js - Settings routes (cafe info, logo, favicon, tables)
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer'); // Import multer instance

// Public route - Get cafe settings
router.get('/', getSettings);

// Protected route - Update cafe settings (admin only)
// Supports: whatsappNumber, cafeName, tables (comma-separated string)
// File uploads: logo (image), favicon (image)
router.put(
  '/',
  protect,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
  ]),
  updateSettings
);

module.exports = router;