const express = require('express');
const router = express.Router();
const {
  getCafeAnalytics,
  trackView,
  trackOrderAttempt,
  trackOrderCompleted,
  getCafeNotes,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/auth');
const subscriptionGuard = require('../middleware/subscriptionGuard');

// ============================================================
// PUBLIC ROUTES – Analytics tracking (no auth)
// ============================================================
router.post('/:slug/view', trackView);
router.post('/:slug/order-attempt', trackOrderAttempt);
router.post('/:slug/order-completed', trackOrderCompleted);

// ============================================================
// PROTECTED ROUTES – Must be logged in
// ============================================================

// ✅ Clean middleware chain for cafe analytics
// Superadmin bypasses subscription check; owners must have 'paid' plan
router.get(
  '/cafe/:cafeId',
  protect,
  (req, res, next) => {
    // If superadmin, skip subscription guard
    if (req.user.role === 'superadmin') {
      return next();
    }
    // Apply subscription guard for owners – requires 'paid' plan
    return subscriptionGuard('paid')(req, res, next);
  },
  getCafeAnalytics
);

// Notes endpoints – only superadmin
router.use(protect, restrictTo('superadmin'));
router.get('/notes/:cafeId', getCafeNotes);
router.post('/notes', createNote);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);

module.exports = router;