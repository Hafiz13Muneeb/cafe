// server/controllers/notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// Rate limiting for superadmin notifications
const notificationRateLimiter = {
  timestamps: [],
  limit: 10,
  windowMs: 60 * 1000,
  checkAndRecord() {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(ts => now - ts < this.windowMs);
    if (this.timestamps.length >= this.limit) {
      throw new Error('Too many notifications sent. Please wait a moment.');
    }
    this.timestamps.push(now);
  },
};

const generateNotificationEmailHTML = (notification) => {
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="UTF-8" /></head>
      <body style="font-family: sans-serif; background: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px;">
          <h2 style="color: #3E2723;">${notification.title}</h2>
          <div style="background: #f9f9f9; padding: 16px; border-left: 4px solid #8A9A5B;">
            <p>${notification.message}</p>
          </div>
          <p style="font-size: 12px; color: #888; text-align: center; margin-top: 24px;">
            &copy; ${new Date().getFullYear()} ${process.env.BRAND_NAME || 'CafeFlow'}
          </p>
        </div>
      </body>
    </html>
  `;
};

// ============================================================
// CONTROLLERS
// ============================================================

const sendNotification = async (req, res, next) => {
  try {
    const { title, message, type, sendEmail: sendEmailFlag } = req.body;
    if (!title || !message) {
      res.status(400);
      throw new Error('Title and message are required');
    }
    if (title.length > 100 || message.length > 5000) {
      res.status(400);
      throw new Error('Title (max 100) and message (max 5000) are too long');
    }
    notificationRateLimiter.checkAndRecord();

    const notification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      type: type || 'announcement',
      sentBy: req.user._id,
      target: 'all',
    });

    if (sendEmailFlag !== false) {
      const owners = await User.find({ role: 'owner' }).select('email');
      const emailList = owners.map(o => o.email).filter(Boolean);
      if (emailList.length > 0 && process.env.RESEND_API_KEY) {
        try {
          await Promise.allSettled(
            emailList.map(email =>
              sendEmail({
                to: email,
                subject: `📢 ${notification.title}`,
                html: generateNotificationEmailHTML(notification),
                from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
              })
            )
          );
        } catch (emailErr) {
          console.error('Failed to send some email notifications:', emailErr);
        }
      }
    }

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getSentNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total] = await Promise.all([
      Notification.find({}).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('sentBy', 'username email'),
      Notification.countDocuments({}),
    ]);
    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getOwnerNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user._id;
    let query = {};
    if (unreadOnly === 'true' || unreadOnly === true) {
      query = { 'readBy.userId': { $ne: userId } };
    }
    const [notifications, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('sentBy', 'username'),
      Notification.countDocuments(query),
    ]);
    const notificationsWithReadStatus = notifications.map(notif => ({
      ...notif.toObject(),
      isRead: notif.readBy.some(entry => entry.userId.toString() === userId.toString()),
    }));
    res.status(200).json({
      success: true,
      data: notificationsWithReadStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const notification = await Notification.findById(id);
    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }
    await notification.markAsRead(userId);
    res.status(200).json({ success: true, message: 'Notification marked as read', data: notification });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ 'readBy.userId': { $ne: userId } });
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ 'readBy.userId': { $ne: userId } });
    await Promise.all(notifications.map(notif => notif.markAsRead(userId)));
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }
    await notification.deleteOne();
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendNotification,
  getSentNotifications,
  getOwnerNotifications,
  markNotificationRead,
  getUnreadCount,
  markAllAsRead,
  deleteNotification,
};