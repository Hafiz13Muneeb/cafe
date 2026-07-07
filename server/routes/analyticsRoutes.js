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

// Analytics for owners – all owners can view (free tier)
// Superadmin bypasses entirely; owners pass through with 'free' guard (no check)
router.get(
  '/cafe/:cafeId',
  protect,
  (req, res, next) => {
    // If superadmin, skip subscription guard
    if (req.user.role === 'superadmin') {
      return next();
    }
    // Allow all owners (free) – no subscription restriction
    return subscriptionGuard('free')(req, res, next);
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