// server/models/OTP.js
const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => Date.now() + 10 * 60 * 1000, // 10 minutes
      index: { expires: 0 }, // TTL – auto‑delete
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    // ✅ Purpose field to differentiate registration vs feedback OTPs
    purpose: {
      type: String,
      enum: ['registration', 'feedback'],
      default: 'registration',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

OTPSchema.index({ email: 1, otp: 1 });
OTPSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.model('OTP', OTPSchema);