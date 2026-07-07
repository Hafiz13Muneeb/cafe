// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const {
  createCheckout,
  getSubscriptionStatus,
  cancelSubscription,
  resumeSubscription,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// ALL ROUTES ARE PROTECTED (require authentication)
router.use(protect);

router.get('/test', (req, res) => {
  res.json({ message: 'Payment routes are working!' });
});

// Create a checkout session
router.post('/create-checkout', createCheckout);

// Get current subscription status
router.get('/subscription', getSubscriptionStatus);

// Cancel subscription at period end
router.post('/cancel', cancelSubscription);

// Resume a cancelled subscription
router.post('/resume', resumeSubscription);

module.exports = router;