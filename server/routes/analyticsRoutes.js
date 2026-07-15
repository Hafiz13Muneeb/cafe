const express = require('express');
const router = express.Router();
const {
  getCafeAnalytics,
  trackView,
  trackOrderAttempt,
  trackOrderCompleted,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// ============================================================
// PUBLIC ROUTES – Analytics tracking (no auth)
// ============================================================
router.post('/:slug/view', trackView);
router.post('/:slug/order-attempt', trackOrderAttempt);
router.post('/:slug/order-completed', trackOrderCompleted);

// ============================================================
// PROTECTED ROUTES – Must be logged in (uses protect middleware)
// ============================================================
// Get analytics for the cafe (uses the first owner from DB or dummy)
// The cafeId is ignored – we'll fetch the first owner in the controller
router.get('/cafe/:cafeId', protect, getCafeAnalytics);

// Note: Notes endpoints removed (superadmin only)

module.exports = router;