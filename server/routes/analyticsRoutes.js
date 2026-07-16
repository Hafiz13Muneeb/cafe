// server/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getCafeAnalytics,
  trackView,
  trackOrderAttempt,
  trackOrderCompleted,
  getInsights, // 🆕 import
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// PUBLIC ROUTES
router.post('/:slug/view', trackView);
router.post('/:slug/order-attempt', trackOrderAttempt);
router.post('/:slug/order-completed', trackOrderCompleted);

// PROTECTED ROUTES
router.get('/cafe/:cafeId', protect, getCafeAnalytics);
router.get('/insights/:cafeId', protect, getInsights); // 🆕

module.exports = router;