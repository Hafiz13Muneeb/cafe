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
// Superadmin can access any cafe analytics without subscription check
router.get('/cafe/:cafeId', protect, async (req, res, next) => {
  // If user is superadmin, allow access
  if (req.user.role === 'superadmin') {
    return getCafeAnalytics(req, res, next);
  }
  // For owners, we need to check subscription
  // We'll use the subscriptionGuard middleware
  // But since we need to pass the guard before getCafeAnalytics, we'll compose it
  // We'll apply the guard inside the route
  const guard = subscriptionGuard('pro');
  guard(req, res, (err) => {
    if (err) return next(err);
    getCafeAnalytics(req, res, next);
  });
});

// Notes endpoints – only superadmin (already protected by restrictTo)
router.use(protect, restrictTo('superadmin'));
router.get('/notes/:cafeId', getCafeNotes);
router.post('/notes', createNote);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);

module.exports = router;