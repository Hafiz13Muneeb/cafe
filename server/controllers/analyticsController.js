const Analytics = require('../models/Analytics');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get analytics for the cafe (single-cafe mode)
// @route   GET /api/analytics/cafe/:cafeId
// @access  Private (Owner)
const getCafeAnalytics = async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    let { cafeId } = req.params;
    const { period = 'week' } = req.query;

    // Fallback to first user if cafeId invalid or not found
    if (!mongoose.Types.ObjectId.isValid(cafeId)) {
      const firstUser = await User.findOne();
      if (!firstUser) {
        return res.status(200).json({
          success: true,
          data: {
            cafe: { id: null, name: '', slug: '' },
            period,
            summary: { totalViews: 0, totalOrderAttempts: 0, totalOrders: 0, totalRevenue: 0, bounceRate: 0 },
            charts: { views: [], orderAttempts: [], completedOrders: [] },
          },
        });
      }
      cafeId = firstUser._id.toString();
    }

    const cafe = await User.findById(cafeId);
    if (!cafe) {
      return res.status(200).json({
        success: true,
        data: {
          cafe: { id: cafeId, name: '', slug: '' },
          period,
          summary: { totalViews: 0, totalOrderAttempts: 0, totalOrders: 0, totalRevenue: 0, bounceRate: 0 },
          charts: { views: [], orderAttempts: [], completedOrders: [] },
        },
      });
    }

    const now = new Date();
    let startDate, groupFormat;
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        groupFormat = '%Y-%m-%d';
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        groupFormat = '%Y-%m-%d';
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        groupFormat = '%Y-%m';
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        groupFormat = '%Y-%m-%d';
    }

    const objectId = new mongoose.Types.ObjectId(cafeId);

    const views = await Analytics.aggregate([
      { $match: { cafeId: objectId, eventType: 'view', date: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: groupFormat, date: '$date' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const orderAttempts = await Analytics.aggregate([
      { $match: { cafeId: objectId, eventType: 'order_attempt', date: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: groupFormat, date: '$date' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const completedOrders = await Analytics.aggregate([
      { $match: { cafeId: objectId, eventType: 'order_completed', date: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: groupFormat, date: '$date' } }, count: { $sum: 1 }, revenue: { $sum: '$orderAmount' } } },
      { $sort: { _id: 1 } },
    ]);

    const totalViews = views.reduce((sum, item) => sum + item.count, 0);
    const totalOrderAttempts = orderAttempts.reduce((sum, item) => sum + item.count, 0);
    const totalOrders = completedOrders.reduce((sum, item) => sum + item.count, 0);
    const totalRevenue = completedOrders.reduce((sum, item) => sum + item.revenue, 0);
    const bounceRate = totalViews > 0 ? ((totalViews - totalOrders) / totalViews) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        cafe: { id: cafe._id, name: cafe.cafeName, slug: cafe.slug },
        period,
        summary: {
          totalViews,
          totalOrderAttempts,
          totalOrders,
          totalRevenue,
          bounceRate: parseFloat(bounceRate.toFixed(1)),
        },
        charts: { views, orderAttempts, completedOrders },
      },
    });
  } catch (error) {
    console.error('Error in getCafeAnalytics:', error);
    next(error);
  }
};

// @desc    Track a menu view – fallback to first user (no role)
// @route   POST /api/analytics/:slug/view
// @access  Public
const trackView = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { sessionId } = req.body;

    // Find cafe by slug – no role filter
    let cafe = await User.findOne({ slug });
    if (!cafe) {
      // Fallback to first user
      cafe = await User.findOne();
      if (!cafe) {
        res.status(404);
        throw new Error('Cafe not found');
      }
    }

    await Analytics.create({
      cafeId: cafe._id,
      eventType: 'view',
      sessionId: sessionId || '',
    });

    res.status(200).json({ success: true, message: 'View tracked' });
  } catch (error) {
    console.error('Error in trackView:', error);
    next(error);
  }
};

// @desc    Track an order attempt – fallback to first user (no role)
// @route   POST /api/analytics/:slug/order-attempt
// @access  Public
const trackOrderAttempt = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { sessionId } = req.body;

    let cafe = await User.findOne({ slug });
    if (!cafe) {
      cafe = await User.findOne();
      if (!cafe) {
        res.status(404);
        throw new Error('Cafe not found');
      }
    }

    await Analytics.create({
      cafeId: cafe._id,
      eventType: 'order_attempt',
      sessionId: sessionId || '',
    });

    res.status(200).json({ success: true, message: 'Order attempt tracked' });
  } catch (error) {
    console.error('Error in trackOrderAttempt:', error);
    next(error);
  }
};

// @desc    Track a completed order – fallback to first user (no role)
// @route   POST /api/analytics/:slug/order-completed
// @access  Public
const trackOrderCompleted = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { sessionId, orderAmount } = req.body;

    let cafe = await User.findOne({ slug });
    if (!cafe) {
      cafe = await User.findOne();
      if (!cafe) {
        res.status(404);
        throw new Error('Cafe not found');
      }
    }

    await Analytics.create({
      cafeId: cafe._id,
      eventType: 'order_completed',
      sessionId: sessionId || '',
      orderAmount: orderAmount || 0,
    });

    res.status(200).json({ success: true, message: 'Order completed tracked' });
  } catch (error) {
    console.error('Error in trackOrderCompleted:', error);
    next(error);
  }
};

module.exports = {
  getCafeAnalytics,
  trackView,
  trackOrderAttempt,
  trackOrderCompleted,
};