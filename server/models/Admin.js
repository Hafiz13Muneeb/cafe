// models/Admin.js - Admin schema with theme settings
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    whatsappNumber: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      match: [/^[0-9]{10,15}$/, 'WhatsApp number must be 10-15 digits, no special chars'],
    },
    cafeName: {
      type: String,
      required: [true, 'Cafe name is required'],
      trim: true,
      maxlength: 100,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    faviconUrl: {
      type: String,
      default: '',
    },
    tables: {
      type: [String],
      default: ['1', '2', '3', '4', '5'],
    },
    // Theme settings
    theme: {
      primaryColor: {
        type: String,
        default: '#d4a843', // gold
      },
      secondaryColor: {
        type: String,
        default: '#b8860b', // dark gold
      },
      mode: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);