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

// ============================================================
// PUBLIC ROUTES – Analytics tracking (no auth)
// ============================================================
router.post('/:slug/view', trackView);
router.post('/:slug/order-attempt', trackOrderAttempt);
router.post('/:slug/order-completed', trackOrderCompleted);

// ============================================================
// PROTECTED ROUTES – SuperAdmin only
// ============================================================
router.use(protect, restrictTo('superadmin'));

// Analytics
router.get('/cafe/:cafeId', getCafeAnalytics);

// Notes
router.get('/notes/:cafeId', getCafeNotes);
router.post('/notes', createNote);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);

module.exports = router;