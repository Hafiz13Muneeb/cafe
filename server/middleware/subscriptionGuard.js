// server/middleware/subscriptionGuard.js
/**
 * Middleware to restrict access based on subscription plan
 * Usage: subscriptionGuard('pro') – allows Pro and Premium users
 *        subscriptionGuard('premium') – allows only Premium users
 *        subscriptionGuard('free') – allows everyone (no restriction)
 */

const PLAN_PRIORITY = {
  free: 0,
  pro: 1,
  premium: 2,
};

const subscriptionGuard = (requiredPlan = 'free') => {
  return (req, res, next) => {
    // 1. Ensure user is authenticated (this middleware should be used after 'protect')
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, please log in',
      });
    }

    // 2. Get subscription details (with fallbacks)
    const userPlan = req.user.subscription?.plan || 'free';
    const userStatus = req.user.subscription?.status || 'active';
    const userPlanPriority = PLAN_PRIORITY[userPlan] || 0;
    const requiredPriority = PLAN_PRIORITY[requiredPlan] || 0;

    // 3. If required is 'free', allow all (no restriction)
    if (requiredPlan === 'free') {
      return next();
    }

    // 4. Check if subscription is active
    if (userStatus !== 'active') {
      return res.status(403).json({
        success: false,
        error: `Your subscription is ${userStatus}. Please renew to access this feature.`,
      });
    }

    // 5. Check if user's plan meets the requirement
    if (userPlanPriority < requiredPriority) {
      const planNames = {
        pro: 'Pro',
        premium: 'Premium',
      };
      return res.status(403).json({
        success: false,
        error: `This feature requires a ${planNames[requiredPlan] || requiredPlan} subscription. Please upgrade.`,
      });
    }

    // 6. Access granted
    next();
  };
};

module.exports = subscriptionGuard;