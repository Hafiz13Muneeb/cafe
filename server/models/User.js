// models/User.js - Simplified for single-cafe (no superadmin, no subscription)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    // Only for the single cafe owner
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
    // 🆕 Support email – where customers send their questions
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    cafeName: {
      type: String,
      required: [true, 'Cafe name is required'],
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    whatsappNumber: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      match: [/^[0-9]{10,15}$/, 'WhatsApp number must be 10-15 digits, no special chars'],
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
    // Theme settings for the public menu
    theme: {
      primaryColor: {
        type: String,
        default: '#d4a843',
      },
      secondaryColor: {
        type: String,
        default: '#b8860b',
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

// ------------------------------------------------
// Index for slug (already unique)
// ------------------------------------------------

// ------------------------------------------------
// Pre-save: hash password and auto-generate slug if missing
// ------------------------------------------------
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  if (this.isModified('cafeName') && !this.slug) {
    const baseSlug = this.cafeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    this.slug = baseSlug;
  }

  next();
});

// ------------------------------------------------
// Method to compare entered password with hashed
// ------------------------------------------------
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Ensure virtuals are included in JSON output
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);