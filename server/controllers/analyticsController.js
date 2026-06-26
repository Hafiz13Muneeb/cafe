const Analytics = require('../models/Analytics');
const User = require('../models/User');
const Note = require('../models/Note');
const mongoose = require('mongoose');

// ============================================================
// ANALYTICS
// ============================================================

// @desc    Get analytics for a specific cafe (superadmin only)
// @route   GET /api/analytics/cafe/:cafeId
// @access  Private (SuperAdmin)
const getCafeAnalytics = async (req, res, next) => {
  try {
    const { cafeId } = req.params;
    const { period = 'week' } = req.query; // 'week', 'month', 'year'

    // Validate cafeId
    if (!mongoose.Types.ObjectId.isValid(cafeId)) {
      res.status(400);
      throw new Error('Invalid cafe ID');
    }

    // Verify cafe exists
    const cafe = await User.findOne({ _id: cafeId, role: 'owner' });
    if (!cafe) {
      res.status(404);
      throw new Error('Cafe not found');
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    let groupFormat;

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

    // Get views
    const views = await Analytics.aggregate([
      {
        $match: {
          cafeId: objectId,
          eventType: 'view',
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$date' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get order attempts
    const orderAttempts = await Analytics.aggregate([
      {
        $match: {
          cafeId: objectId,
          eventType: 'order_attempt',
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$date' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get completed orders (with revenue)
    const completedOrders = await Analytics.aggregate([
      {
        $match: {
          cafeId: objectId,
          eventType: 'order_completed',
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$date' } },
          count: { $sum: 1 },
          revenue: { $sum: '$orderAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Calculate totals
    const totalViews = views.reduce((sum, item) => sum + item.count, 0);
    const totalOrderAttempts = orderAttempts.reduce((sum, item) => sum + item.count, 0);
    const totalOrders = completedOrders.reduce((sum, item) => sum + item.count, 0);
    const totalRevenue = completedOrders.reduce((sum, item) => sum + item.revenue, 0);
    const bounceRate = totalViews > 0 ? ((totalViews - totalOrders) / totalViews) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        cafe: {
          id: cafe._id,
          name: cafe.cafeName,
          slug: cafe.slug,
        },
        period,
        summary: {
          totalViews,
          totalOrderAttempts,
          totalOrders,
          totalRevenue,
          bounceRate: parseFloat(bounceRate.toFixed(1)),
        },
        charts: {
          views,
          orderAttempts,
          completedOrders,
        },
      },
    });
  } catch (error) {
    console.error('Error in getCafeAnalytics:', error);
    next(error);
  }
};

// @desc    Track a menu view (public)
// @route   POST /api/analytics/:slug/view
// @access  Public
const trackView = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { sessionId } = req.body;

    const cafe = await User.findOne({ slug, role: 'owner' });
    if (!cafe) {
      res.status(404);
      throw new Error('Cafe not found');
    }

    await Analytics.create({
      cafeId: cafe._id,
      eventType: 'view',
      sessionId: sessionId || '',
    });

    res.status(200).json({
      success: true,
      message: 'View tracked',
    });
  } catch (error) {
    console.error('Error in trackView:', error);
    next(error);
  }
};

// @desc    Track an order attempt (public)
// @route   POST /api/analytics/:slug/order-attempt
// @access  Public
const trackOrderAttempt = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { sessionId } = req.body;

    const cafe = await User.findOne({ slug, role: 'owner' });
    if (!cafe) {
      res.status(404);
      throw new Error('Cafe not found');
    }

    await Analytics.create({
      cafeId: cafe._id,
      eventType: 'order_attempt',
      sessionId: sessionId || '',
    });

    res.status(200).json({
      success: true,
      message: 'Order attempt tracked',
    });
  } catch (error) {
    console.error('Error in trackOrderAttempt:', error);
    next(error);
  }
};

// @desc    Track a completed order (public)
// @route   POST /api/analytics/:slug/order-completed
// @access  Public
const trackOrderCompleted = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { sessionId, orderAmount } = req.body;

    const cafe = await User.findOne({ slug, role: 'owner' });
    if (!cafe) {
      res.status(404);
      throw new Error('Cafe not found');
    }

    await Analytics.create({
      cafeId: cafe._id,
      eventType: 'order_completed',
      sessionId: sessionId || '',
      orderAmount: orderAmount || 0,
    });

    res.status(200).json({
      success: true,
      message: 'Order completed tracked',
    });
  } catch (error) {
    console.error('Error in trackOrderCompleted:', error);
    next(error);
  }
};

// ============================================================
// NOTES
// ============================================================

// @desc    Get all notes for a cafe (superadmin only)
// @route   GET /api/notes/:cafeId
// @access  Private (SuperAdmin)
const getCafeNotes = async (req, res, next) => {
  try {
    const { cafeId } = req.params;

    // Validate cafeId
    if (!mongoose.Types.ObjectId.isValid(cafeId)) {
      res.status(400);
      throw new Error('Invalid cafe ID');
    }

    const notes = await Note.find({ cafeId })
      .sort({ reminderDate: 1, createdAt: -1 })
      .populate('createdBy', 'username');

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error('Error in getCafeNotes:', error);
    next(error);
  }
};

// @desc    Create a note (superadmin only)
// @route   POST /api/notes
// @access  Private (SuperAdmin)
const createNote = async (req, res, next) => {
  try {
    const { cafeId, title, content, reminderDate } = req.body;

    if (!cafeId || !title || !content) {
      res.status(400);
      throw new Error('Cafe ID, title, and content are required');
    }

    // Validate cafeId
    if (!mongoose.Types.ObjectId.isValid(cafeId)) {
      res.status(400);
      throw new Error('Invalid cafe ID');
    }

    const note = await Note.create({
      cafeId,
      title: title.trim(),
      content: content.trim(),
      reminderDate: reminderDate ? new Date(reminderDate) : null,
      isReminderActive: !!reminderDate,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error('Error in createNote:', error);
    next(error);
  }
};

// @desc    Update a note (superadmin only)
// @route   PUT /api/notes/:id
// @access  Private (SuperAdmin)
const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, reminderDate, isReminderActive } = req.body;

    const note = await Note.findById(id);
    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (reminderDate !== undefined) {
      note.reminderDate = reminderDate ? new Date(reminderDate) : null;
      note.isReminderActive = !!reminderDate;
    }
    if (isReminderActive !== undefined) {
      note.isReminderActive = isReminderActive;
    }

    await note.save();

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error('Error in updateNote:', error);
    next(error);
  }
};

// @desc    Delete a note (superadmin only)
// @route   DELETE /api/notes/:id
// @access  Private (SuperAdmin)
const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);
    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteNote:', error);
    next(error);
  }
};

module.exports = {
  getCafeAnalytics,
  trackView,
  trackOrderAttempt,
  trackOrderCompleted,
  getCafeNotes,
  createNote,
  updateNote,
  deleteNote,
};