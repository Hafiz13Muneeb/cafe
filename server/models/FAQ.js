// server/models/FAQ.js - FAQ schema for customer-facing FAQs
const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      maxlength: 200,
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
      maxlength: 1000,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for sorting
FAQSchema.index({ order: 1, isActive: -1 });

module.exports = mongoose.model('FAQ', FAQSchema);