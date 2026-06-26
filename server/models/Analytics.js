const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
  {
    cafeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Type of event
    eventType: {
      type: String,
      enum: ['view', 'order_attempt', 'order_completed'],
      required: true,
      index: true,
    },
    // Optional metadata
    sessionId: {
      type: String,
      default: '',
    },
    // For revenue tracking (when order_completed)
    orderAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast queries
AnalyticsSchema.index({ cafeId: 1, date: 1, eventType: 1 });
AnalyticsSchema.index({ cafeId: 1, eventType: 1, date: -1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);