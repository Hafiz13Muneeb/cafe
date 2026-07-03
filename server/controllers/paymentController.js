// server/controllers/paymentController.js
const crypto = require('crypto');
const User = require('../models/User');
const WebhookLog = require('../models/WebhookLog');

// ------------------------------------------------
// 1. CREATE CHECKOUT
// ------------------------------------------------
const createCheckout = async (req, res, next) => {
  try {
    const { variantId, returnUrl } = req.body;

    if (!variantId) {
      res.status(400);
      throw new Error('Variant ID is required');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.subscription?.status === 'active') {
      res.status(400);
      throw new Error('You already have an active subscription');
    }

    const apiUrl = 'https://api.lemonsqueezy.com/v1/checkouts';

    const payload = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: user.email,
            name: user.username,
            custom: {
              user_id: user._id.toString(),
            },
          },
          product_options: {
            redirect_url: returnUrl || process.env.LEMON_SQUEEZY_RETURN_URL,
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: process.env.LEMON_SQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId.toString(),
            },
          },
        },
      },
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Lemon Squeezy API error:', data);
      res.status(response.status);
      throw new Error(data.errors?.[0]?.detail || 'Failed to create checkout session');
    }

    const checkoutUrl = data?.data?.attributes?.url;
    if (!checkoutUrl) {
      res.status(500);
      throw new Error('No checkout URL returned');
    }

    res.status(200).json({
      success: true,
      data: { checkoutUrl },
    });
  } catch (error) {
    console.error('Create checkout error:', error.message);
    next(error);
  }
};

// ------------------------------------------------
// 2. WEBHOOK HANDLER
// ------------------------------------------------
const webhookHandler = async (req, res, next) => {
  try {
    const signature = req.headers['x-signature'];
    if (!signature) {
      return res.status(401).json({ error: 'Missing signature' });
    }

    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const eventId = event.meta?.event_id;
    const eventType = event.meta?.event_name;

    if (!eventId || !eventType) {
      console.error('Missing event ID or type');
      return res.status(400).json({ error: 'Invalid webhook structure' });
    }

    // Idempotency check
    const existingLog = await WebhookLog.findOne({ eventId });
    if (existingLog) {
      console.log(`Event ${eventId} already processed, skipping.`);
      return res.status(200).json({ received: true, alreadyProcessed: true });
    }

    const log = new WebhookLog({
      eventId,
      eventType,
      payload: event,
      receivedAt: new Date(),
    });

    try {
      const { data } = event;
      const customerId = data?.attributes?.customer_id?.toString();
      const variantId = data?.attributes?.variant_id;
      const status = data?.attributes?.status;
      const endsAt = data?.attributes?.ends_at;

      let userId = null;
      let user = await User.findOne({ 'subscription.lemonSqueezyId': customerId });

      if (!user && data?.attributes?.checkout_data?.custom?.user_id) {
        const customUserId = data.attributes.checkout_data.custom.user_id;
        user = await User.findById(customUserId);
      }

      if (user) {
        userId = user._id;

        let ourStatus = 'active';
        if (status === 'expired') ourStatus = 'expired';
        else if (status === 'cancelled') ourStatus = 'cancelled';
        else if (status === 'past_due') ourStatus = 'past_due';

        let plan = 'free';
        const proVariantId = parseInt(process.env.LEMON_SQUEEZY_PRO_VARIANT_ID);
        const premiumVariantId = parseInt(process.env.LEMON_SQUEEZY_PREMIUM_VARIANT_ID);

        if (variantId === proVariantId) plan = 'pro';
        else if (variantId === premiumVariantId) plan = 'premium';

        user.subscription = {
          plan,
          status: ourStatus,
          lemonSqueezyId: customerId,
          variantId: variantId,
          currentPeriodEnd: endsAt ? new Date(endsAt) : undefined,
          cancelAtPeriodEnd: status === 'cancelled',
        };

        await user.save();
        log.userId = user._id;
        log.status = 'processed';
        log.processedAt = new Date();
      } else {
        log.status = 'failed';
        log.error = 'No matching user found for this subscription';
      }

      await log.save();

      res.status(200).json({
        received: true,
        processed: true,
        userId,
      });
    } catch (processingError) {
      log.status = 'failed';
      log.error = processingError.message;
      await log.save();

      console.error('Webhook processing error:', processingError);
      res.status(200).json({
        received: true,
        processed: false,
        error: processingError.message,
      });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({
      received: true,
      error: error.message,
    });
  }
};

// ------------------------------------------------
// 3. GET SUBSCRIPTION STATUS
// ------------------------------------------------
const getSubscriptionStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('subscription');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        plan: user.subscription?.plan || 'free',
        status: user.subscription?.status || 'active',
        currentPeriodEnd: user.subscription?.currentPeriodEnd || null,
        cancelAtPeriodEnd: user.subscription?.cancelAtPeriodEnd || false,
        trialEndsAt: user.subscription?.trialEndsAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------
// 4. CANCEL SUBSCRIPTION
// ------------------------------------------------
const cancelSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!user.subscription?.lemonSqueezyId || user.subscription?.status !== 'active') {
      res.status(400);
      throw new Error('No active subscription to cancel');
    }

    const customerId = user.subscription.lemonSqueezyId;
    const apiUrl = `https://api.lemonsqueezy.com/v1/customers/${customerId}/subscriptions`;

    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: 'subscriptions',
          attributes: {
            cancel_at_period_end: true,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Lemon Squeezy cancel error:', data);
      res.status(response.status);
      throw new Error(data.errors?.[0]?.detail || 'Failed to cancel subscription');
    }

    user.subscription.cancelAtPeriodEnd = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error.message);
    next(error);
  }
};

// ------------------------------------------------
// 5. RESUME SUBSCRIPTION
// ------------------------------------------------
const resumeSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!user.subscription?.lemonSqueezyId) {
      res.status(400);
      throw new Error('No subscription found');
    }

    const customerId = user.subscription.lemonSqueezyId;
    const apiUrl = `https://api.lemonsqueezy.com/v1/customers/${customerId}/subscriptions`;

    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: 'subscriptions',
          attributes: {
            cancel_at_period_end: false,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Lemon Squeezy resume error:', data);
      res.status(response.status);
      throw new Error(data.errors?.[0]?.detail || 'Failed to resume subscription');
    }

    user.subscription.cancelAtPeriodEnd = false;
    user.subscription.status = 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscription resumed successfully',
    });
  } catch (error) {
    console.error('Resume subscription error:', error.message);
    next(error);
  }
};

module.exports = {
  createCheckout,
  webhookHandler,
  getSubscriptionStatus,
  cancelSubscription,
  resumeSubscription,
};