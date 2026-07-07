const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getGlobalSettings,
  updateGlobalSettings,
  updateGlobalFavicon,
  getPricing,
  updatePricing,
} = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/auth');
const subscriptionGuard = require('../middleware/subscriptionGuard');
const upload = require('../config/multer');

// ============================================================
// PUBLIC ROUTES – No authentication required
// ============================================================

// Global settings (theme, favicon, pricing)
router.get('/global', getGlobalSettings);

// Public pricing endpoint – fetch current monthly price and trial days
router.get('/pricing', getPricing);

// ============================================================
// PROTECTED ROUTES – Owner settings (require login)
// ============================================================
router.use(protect);

// Get owner settings (cafeName, whatsapp, tables, logo, favicon, currency)
router.get('/', getSettings);

// Update basic owner settings (cafeName, whatsapp, tables, logo, favicon, currency)
// This route does NOT allow theme color changes – they go to /theme
router.put(
  '/',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
  ]),
  updateSettings
);

// 🆕 Update theme settings (primaryColor, secondaryColor, mode) – requires PAID subscription
router.put(
  '/theme',
  upload.none(), // No file uploads for theme
  subscriptionGuard('paid'),
  updateSettings
);

// ============================================================
// SUPERADMIN ONLY – Global settings and pricing
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

// Update pricing (monthlyPrice, trialPeriodDays) – SuperAdmin only
router.put('/pricing', protect, restrictTo('superadmin'), updatePricing);

module.exports = router;