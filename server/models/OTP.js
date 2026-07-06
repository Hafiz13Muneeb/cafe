// server/models/OTP.js
const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema(
  {
    // The email address the OTP is sent to
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    // The one-time password (6-digit numeric)
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      trim: true,
    },
    // When the OTP expires (default: 10 minutes from creation)
    expiresAt: {
      type: Date,
      required: true,
      default: () => Date.now() + 10 * 60 * 1000, // 10 minutes
      index: { expires: 0 }, // TTL: MongoDB will auto-delete after expiry
    },
    // Whether this OTP has been used
    verified: {
      type: Boolean,
      default: false,
    },
    // Optional: track how many times this OTP was attempted
    attemptCount: {
      type: Number,
      default: 0,
    },
    // Optional: max attempts (e.g., 3) – can be enforced in controller
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Index for fast lookups by email and OTP (for verification)
OTPSchema.index({ email: 1, otp: 1 });

// Ensure only one active OTP per email at a time (optional, but recommended)
// You can enforce this in the controller by deleting old OTPs before creating a new one.

module.exports = mongoose.model('OTP', OTPSchema);