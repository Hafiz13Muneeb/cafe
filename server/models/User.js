// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    // Common fields for all users (superadmin and owners)
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['superadmin', 'owner'],
      default: 'owner',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },

    // Cafe owner specific fields (only used when role === 'owner')
    cafeName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    whatsappNumber: {
      type: String,
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
    // ✅ NEW: Currency used for selling items (e.g., 'Rs', '$', '€')
    currency: {
      type: String,
      default: 'Rs',
      trim: true,
      maxlength: 10,
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

    // ----------------------------------------------------
    // Subscription & Payment (Lemon Squeezy)
    // ----------------------------------------------------
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'paid'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'cancelled', 'expired', 'past_due'],
        default: 'active',
      },
      lemonSqueezyId: {
        type: String,
        unique: true,
        sparse: true,
      },
      lemonSqueezySubscriptionId: {
        type: String,
        unique: true,
        sparse: true,
      },
      variantId: {
        type: Number,
      },
      currentPeriodEnd: {
        type: Date,
      },
      cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
      },
      trialEndsAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// ------------------------------------------------
// Indexes for performance
// ------------------------------------------------
UserSchema.index({ role: 1, isBlocked: 1 });
UserSchema.index({ 'subscription.status': 1, 'subscription.plan': 1 });
// ✅ Optional: index for currency if you plan to query by it
// UserSchema.index({ currency: 1 });

// ------------------------------------------------
// Pre-save: hash password and auto-generate slug
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

  if (this.role === 'owner' && this.isModified('cafeName') && !this.slug) {
    const baseSlug = this.cafeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    this.slug = baseSlug;
  }

  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.virtual('isSuperAdmin').get(function () {
  return this.role === 'superadmin';
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);