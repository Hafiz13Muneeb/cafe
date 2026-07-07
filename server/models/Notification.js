// server/models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    // Title of the notification
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 100,
    },
    // The main message content
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 5000,
    },
    // Type of notification (for future extensibility)
    type: {
      type: String,
      enum: ['announcement', 'system', 'update', 'feedback_response'],
      default: 'announcement',
    },
    // Who sent this notification (superadmin ID)
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Target audience – for now we only support 'all', but can extend
    target: {
      type: String,
      enum: ['all', 'owners', 'superadmins'],
      default: 'all',
    },
    // Array of user IDs who have read this notification
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Optional: link to a related entity (e.g., feedback ID)
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedModel',
    },
    relatedModel: {
      type: String,
      enum: ['Feedback'],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// ============================================================
// Indexes for performance
// ============================================================

// 1. For fetching notifications for a specific user (unread)
NotificationSchema.index({ 'readBy.userId': 1, createdAt: -1 });

// 2. For filtering by type and date
NotificationSchema.index({ type: 1, createdAt: -1 });

// 3. For counting unread notifications per user
//    (MongoDB can use the existing index on readBy.userId)

// ============================================================
// Instance methods
// ============================================================

/**
 * Check if a user has already read this notification.
 * @param {string|ObjectId} userId - The user's ID.
 * @returns {boolean} - True if the user has read it.
 */
NotificationSchema.methods.isReadByUser = function (userId) {
  if (!userId) return false;
  const userIdStr = userId.toString();
  return this.readBy.some((entry) => entry.userId.toString() === userIdStr);
};

/**
 * Mark a notification as read for a specific user.
 * @param {string|ObjectId} userId - The user's ID.
 * @returns {Promise<Notification>} - The updated notification.
 */
NotificationSchema.methods.markAsRead = function (userId) {
  if (!userId) return this;
  const userIdStr = userId.toString();
  const alreadyRead = this.readBy.some(
    (entry) => entry.userId.toString() === userIdStr
  );
  if (!alreadyRead) {
    this.readBy.push({ userId, readAt: new Date() });
  }
  return this.save();
};

// ============================================================
// Static methods
// ============================================================

/**
 * Get unread notifications for a user.
 * @param {string|ObjectId} userId - The user's ID.
 * @param {number} limit - Max number of notifications to return.
 * @param {number} skip - Number to skip (for pagination).
 * @returns {Promise<Array>} - Array of notifications.
 */
NotificationSchema.statics.getUnreadForUser = function (userId, limit = 10, skip = 0) {
  return this.find({
    'readBy.userId': { $ne: userId },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sentBy', 'username');
};

/**
 * Get all notifications for a user (both read and unread).
 * @param {string|ObjectId} userId - The user's ID.
 * @param {number} limit - Max number of notifications to return.
 * @param {number} skip - Number to skip (for pagination).
 * @returns {Promise<Array>} - Array of notifications.
 */
NotificationSchema.statics.getAllForUser = function (userId, limit = 20, skip = 0) {
  return this.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sentBy', 'username');
};

// Ensure virtuals are included in JSON output
NotificationSchema.set('toJSON', { virtuals: true });
NotificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', NotificationSchema);