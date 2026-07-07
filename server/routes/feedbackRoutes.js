const express = require('express');
const router = express.Router();
const {
  sendFeedbackOTP,
  submitFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} = require('../controllers/feedbackController');
const { protect, restrictTo } = require('../middleware/auth');

// ============================================================
// PUBLIC ROUTES (no authentication required)
// ============================================================

// Send OTP for feedback verification
router.post('/send-otp', sendFeedbackOTP);

// ============================================================
// PROTECTED ROUTES – now require login for submission
// ============================================================

// Submit feedback – logged‑in users bypass OTP
router.post('/submit', protect, submitFeedback);

// ============================================================
// SUPERADMIN ONLY
// ============================================================
router.use(protect, restrictTo('superadmin'));

router.get('/', getAllFeedback);
router.patch('/:id/status', updateFeedbackStatus);
router.delete('/:id', deleteFeedback);

module.exports = router;