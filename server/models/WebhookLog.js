const mongoose = require('mongoose');

const WebhookLogSchema = new mongoose.Schema(
  {
    // The unique event ID from Lemon Squeezy (for idempotency)
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // The event type: order_created, subscription_created, etc.
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    // The full raw payload from Lemon Squeezy
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // Processing status
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending',
    },
    // Error message if processing failed
    error: {
      type: String,
      default: '',
    },
    // The user ID associated with this event (if found)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    // When the event was received
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // When the event was processed
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Composite indexes for fast filtering
WebhookLogSchema.index({ eventType: 1, status: 1 });
WebhookLogSchema.index({ receivedAt: -1 });

module.exports = mongoose.model('WebhookLog', WebhookLogSchema);