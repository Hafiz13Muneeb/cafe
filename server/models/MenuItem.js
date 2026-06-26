const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema(
  {
    // 🔐 Multi-tenancy: every item belongs to a specific cafe owner
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ------------------------------------------------
// Compound indexes for optimal filtering
// ------------------------------------------------
// 1. For fetching a cafe's menu with optional category & availability filters
MenuItemSchema.index({ ownerId: 1, category: 1, isAvailable: 1 });
// 2. For sorting by creation date
MenuItemSchema.index({ ownerId: 1, createdAt: -1 });

// 3. Text search (if you want to add search functionality later)
MenuItemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('MenuItem', MenuItemSchema);