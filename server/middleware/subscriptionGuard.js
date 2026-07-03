// server/middleware/subscriptionGuard.js
/**
 * Middleware to restrict access based on subscription plan.
 * Usage: subscriptionGuard() – requires 'paid' plan.
 *        subscriptionGuard('free') – allows everyone (no restriction)
 */

const subscriptionGuard = (requiredPlan = 'paid') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, please log in',
      });
    }

    // If no restriction (free), allow all
    if (requiredPlan === 'free') {
      return next();
    }

    const userPlan = req.user.subscription?.plan || 'free';
    const userStatus = req.user.subscription?.status || 'active';

    // Only 'paid' plan with 'active' status grants access
    if (userPlan !== 'paid' || userStatus !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'This feature requires an active subscription. Please upgrade.',
      });
    }

    next();
  };
};

module.exports = subscriptionGuard;