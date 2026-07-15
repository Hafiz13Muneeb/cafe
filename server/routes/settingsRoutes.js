const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getGlobalSettings,
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');

// ============================================================
// PUBLIC ROUTE – Global settings (returns owner's theme)
// ============================================================
router.get('/global', getGlobalSettings);

// ============================================================
// PROTECTED ROUTES – Owner settings
// ============================================================
router.use(protect);

// Get owner settings (cafeName, whatsapp, tables, logo, favicon, slug, theme)
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

// All superadmin-only routes removed

module.exports = router;