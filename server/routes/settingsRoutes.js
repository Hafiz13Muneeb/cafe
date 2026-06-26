const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer'); // multer instance with fields

// All routes are protected (owner only)
router.use(protect);

// Get owner settings
router.get('/', getSettings);

// Update owner settings (with logo & favicon upload)
router.put(
  '/',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
  ]),
  updateSettings
);

module.exports = router;