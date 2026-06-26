const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getGlobalSettings,
  updateGlobalSettings,
  updateGlobalFavicon,
} = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../config/multer');

// ============================================================
// PUBLIC ROUTE – Global settings (no auth required)
// ============================================================
router.get('/global', getGlobalSettings);

// ============================================================
// PROTECTED ROUTES – Owner settings
// ============================================================
router.use(protect);

// Get owner settings (cafeName, whatsapp, tables, logo, favicon)
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

// ============================================================
// SUPERADMIN ONLY – Global settings
// ============================================================

// Update global colors & mode (JSON)
router.put('/global', restrictTo('superadmin'), updateGlobalSettings);

// Update global favicon (file upload)
router.put(
  '/global/favicon',
  restrictTo('superadmin'),
  upload.single('favicon'),
  updateGlobalFavicon
);

module.exports = router;