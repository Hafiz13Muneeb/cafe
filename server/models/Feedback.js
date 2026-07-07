// server/models/Feedback.js
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    // Optional: if the user is logged in, we can track who submitted it
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    // The email address of the submitter (verified via OTP)
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    // The feedback message
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 2000,
    },
    // Status of the feedback (for superadmin to manage)
    status: {
      type: String,
      enum: ['pending', 'resolved', 'spam'],
      default: 'pending',
      index: true,
    },
    // Optional: type of feedback (feature request, bug, general, etc.)
    type: {
      type: String,
      enum: ['general', 'bug', 'feature', 'complaint', 'suggestion'],
      default: 'general',
    },
    // Optional: admin response (if superadmin replies)
    response: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    // Optional: when admin responded
    respondedAt: {
      type: Date,
    },
    // Optional: who responded (superadmin ID)
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Compound index for faster queries (e.g., status + createdAt)
FeedbackSchema.index({ status: 1, createdAt: -1 });

// Ensure we can quickly check if an email already submitted feedback recently
FeedbackSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);