// models/MenuItem.js
const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema(
  {
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
      index: true, // for faster filtering
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true, // for filtering available items
    },
  },
  {
    timestamps: true,
  }
);

// Optional: add text index for search
MenuItemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('MenuItem', MenuItemSchema);